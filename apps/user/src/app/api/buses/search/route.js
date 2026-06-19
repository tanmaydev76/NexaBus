import { NextResponse } from 'next/server';
import { connectDB, Trip, Bus, Route, TripSeat, Operator } from '@nexabus/db';

// Returns ordered stop list: [origin, ...intermediate stops, destination]
// Each entry has { name, time } where time is departure time at that stop.
function getStopSequence(route, tripDeparture, tripArrival) {
  const seq = [{ name: route.origin, time: tripDeparture }];
  for (const s of route.stops || []) {
    if (s.name) seq.push({ name: s.name, time: s.departureTime || s.arrivalTime || '' });
  }
  seq.push({ name: route.destination, time: tripArrival });
  return seq;
}

// Returns the index of cityName in the stop sequence (-1 if not found).
function findInSequence(seq, cityName) {
  const rx = new RegExp(cityName.trim(), 'i');
  return seq.findIndex((s) => rx.test(s.name));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from')?.trim() || '';
  const to   = searchParams.get('to')?.trim()   || '';
  const date = searchParams.get('date')          || '';

  if (!from || !to || !date) {
    return NextResponse.json({ error: 'Missing from, to, or date' }, { status: 400 });
  }

  await connectDB();

  const fromReg = new RegExp(from, 'i');
  const toReg   = new RegExp(to,   'i');

  // Match routes where from/to appear as origin, destination, OR any stop name.
  const routes = await Route.find({
    status: 'active',
    $and: [
      { $or: [{ origin: fromReg }, { destination: fromReg }, { 'stops.name': fromReg }] },
      { $or: [{ origin: toReg   }, { destination: toReg   }, { 'stops.name': toReg   }] },
    ],
  }).lean();

  if (!routes.length) return NextResponse.json({ buses: [] });

  const routeIds = routes.map((r) => r._id);

  const trips = await Trip.find({
    routeId:       { $in: routeIds },
    departureDate: date,
    status:        { $in: ['scheduled', 'active'] },
  }).lean();

  if (!trips.length) return NextResponse.json({ buses: [] });

  const busIds      = [...new Set(trips.map((t) => t.busId.toString()))];
  const operatorIds = [...new Set(trips.map((t) => t.operatorId.toString()))];
  const tripIds     = trips.map((t) => t._id);

  const [buses, operators, allTripSeats] = await Promise.all([
    Bus.find({ _id: { $in: busIds } }).lean(),
    Operator.find({ _id: { $in: operatorIds } }).select('companyName name').lean(),
    TripSeat.find({ tripId: { $in: tripIds } }).lean(),
  ]);

  const busMap      = Object.fromEntries(buses.map((b)    => [b._id.toString(), b]));
  const operatorMap = Object.fromEntries(operators.map((o) => [o._id.toString(), o]));
  const routeMap    = Object.fromEntries(routes.map((r)   => [r._id.toString(), r]));

  const seatsByTrip = {};
  for (const ts of allTripSeats) {
    const tid = ts.tripId.toString();
    if (!seatsByTrip[tid]) seatsByTrip[tid] = [];
    seatsByTrip[tid].push(ts);
  }

  const busList = trips.map((trip) => {
    const bus      = busMap[trip.busId.toString()];
    const operator = operatorMap[trip.operatorId.toString()];
    const route    = routeMap[trip.routeId.toString()];
    if (!bus || !route) return null;

    const dept = trip.departureTime || '00:00';
    const arrv = trip.arrivalTime   || '00:00';

    // Verify from appears before to in the stop sequence for this trip.
    const seq      = getStopSequence(route, dept, arrv);
    const fromIdx  = findInSequence(seq, from);
    const toIdx    = findInSequence(seq, to);
    if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) return null;

    // Use the actual stop names and times for boarding/alighting.
    const boardingStop  = seq[fromIdx];
    const alightingStop = seq[toIdx];
    const boardingTime  = boardingStop.time  || dept;
    const alightingTime = alightingStop.time || arrv;

    const [dh, dm] = boardingTime.split(':').map(Number);
    const [ah, am] = alightingTime.split(':').map(Number);
    let totalMin = (ah * 60 + am) - (dh * 60 + dm);
    if (totalMin < 0) totalMin += 24 * 60;
    const durH = Math.floor(totalMin / 60);
    const durM = totalMin % 60;
    const duration = durM > 0 ? `${durH}h ${durM}m` : `${durH}h`;

    const tripId     = trip._id.toString();
    const tripSeats  = seatsByTrip[tripId] || [];
    const totalSeats = bus.totalSeats || 40;
    const availableSeats = tripSeats.length > 0
      ? tripSeats.filter((s) => s.status === 'available' || s.status === 'ladies').length
      : totalSeats;

    const busType   = bus.busType || 'Seater';
    const isAC      = busType.toLowerCase().includes('ac');
    const isSleeper = busType.toLowerCase().includes('sleeper');
    const isVolvo   = (bus.amenities || []).some(
      (a) => typeof a === 'string' && a.toLowerCase() === 'volvo',
    );

    // All stops visible to the user (full route stops for boarding/drop selection).
    const stops = seq.map((s) => ({ name: s.name, time: s.time || '' }));

    // Dedicated boarding/dropping points defined by the operator on the route.
    const boardingPoints = (route.boardingPoints || [])
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ name: p.name, time: p.time, landmark: p.landmark || '' }));
    const droppingPoints = (route.droppingPoints || [])
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ name: p.name, time: p.time, landmark: p.landmark || '' }));

    return {
      id:              tripId,
      operator:        operator?.companyName || operator?.name || bus.busName,
      type:            busType,
      busType,
      departure:       boardingTime,
      arrival:         alightingTime,
      duration,
      price:           trip.fare,
      totalSeats,
      availableSeats,
      amenities:       bus.amenities || [],
      rating:          4.0,
      isAC,
      isSleeper,
      freeCancellation: false,
      hasLiveTracking:  false,
      isVolvo,
      isSingleWindow:  false,
      stops,
      boardingPoints,
      droppingPoints,
      from:            boardingStop.name,
      to:              alightingStop.name,
    };
  }).filter(Boolean);

  return NextResponse.json({ buses: busList });
}
