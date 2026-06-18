import { NextResponse } from 'next/server';
import { connectDB, Trip, Bus, TripSeat, Booking } from '@nexabus/db';

function buildSeaterRows(seats) {
  // 2+2 layout: W A null(gap) A W = 5 columns
  const rows = [];
  let i = 0;
  while (i < seats.length) {
    const row = [];
    for (let col = 0; col < 5; col++) {
      if (col === 2) { row.push(null); continue; }
      if (i < seats.length) row.push(seats[i++]);
      else row.push(null);
    }
    rows.push(row);
  }
  return rows;
}

function buildSleeperRows(seats) {
  // 1+2 layout: W null A W = 4 columns
  const rows = [];
  let i = 0;
  while (i < seats.length) {
    const row = [];
    const positions = ['window', null, 'aisle', 'window'];
    for (const pos of positions) {
      if (pos === null) { row.push(null); continue; }
      if (i < seats.length) row.push(seats[i++]);
      else row.push(null);
    }
    rows.push(row);
  }
  return rows;
}

export async function GET(req, { params }) {
  const { tripId } = await params;
  await connectDB();

  const trip = await Trip.findById(tripId).lean();
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

  const bus = await Bus.findById(trip.busId).lean();
  if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });

  const busType   = bus.busType || 'Seater';
  const isSleeper = busType.toLowerCase().includes('sleeper');
  const totalSeats = bus.totalSeats || 40;

  let tripSeats = await TripSeat.find({ tripId: trip._id }).lean();

  if (!tripSeats.length) {
    const toInsert = Array.from({ length: totalSeats }, (_, idx) => ({
      tripId:     trip._id,
      seatId:     `S${idx + 1}`,
      seatNumber: `S${idx + 1}`,
      status:     'available',
    }));
    try {
      await TripSeat.insertMany(toInsert, { ordered: false });
    } catch {}
    tripSeats = await TripSeat.find({ tripId: trip._id }).lean();
  }

  // Find which booked seats were booked by female passengers
  const bookedWithId = tripSeats.filter((s) => s.status === 'booked' && s.bookingId);
  const femaleBookedSeatIds = new Set();
  if (bookedWithId.length > 0) {
    const bookingIds = [...new Set(bookedWithId.map((s) => s.bookingId.toString()))];
    const bookings = await Booking.find({ _id: { $in: bookingIds } })
      .select('seats passengers')
      .lean();
    for (const booking of bookings) {
      for (const seat of (booking.seats || [])) {
        const passenger = (booking.passengers || []).find((p) => p.seatNumber === seat.number);
        if (passenger?.gender === 'Female') femaleBookedSeatIds.add(seat.id);
      }
    }
  }

  // For each female-booked seat, find its adjacent seat and retroactively mark it
  // as 'ladies' if it is still available (fixes bookings made before this feature)
  if (femaleBookedSeatIds.size > 0) {
    const seatsPerRow = isSleeper ? 3 : 4;
    const adjacentToFemale = new Set();
    for (const seatId of femaleBookedSeatIds) {
      const n = parseInt(seatId.replace(/\D/g, ''), 10);
      if (!n) continue;
      const pos = (n - 1) % seatsPerRow;
      let adj = null;
      if (isSleeper) {
        if (pos === 1) adj = `S${n + 1}`;
        else if (pos === 2) adj = `S${n - 1}`;
      } else {
        if (pos === 0) adj = `S${n + 1}`;
        else if (pos === 1) adj = `S${n - 1}`;
        else if (pos === 2) adj = `S${n + 1}`;
        else if (pos === 3) adj = `S${n - 1}`;
      }
      if (adj) adjacentToFemale.add(adj);
    }

    if (adjacentToFemale.size > 0) {
      await TripSeat.updateMany(
        { tripId: trip._id, seatId: { $in: [...adjacentToFemale] }, status: 'available' },
        { $set: { status: 'ladies' } }
      );
      // Update in-memory so the response reflects the change without a refetch
      for (const ts of tripSeats) {
        if (adjacentToFemale.has(ts.seatId) && ts.status === 'available') {
          ts.status = 'ladies';
        }
      }
    }
  }

  const seatObjects = tripSeats
    .sort((a, b) => {
      const na = parseInt(a.seatId.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.seatId.replace(/\D/g, ''), 10) || 0;
      return na - nb;
    })
    .map((ts) => ({
      id:           ts.seatId,
      number:       ts.seatNumber,
      type:         'aisle',
      status:       ts.status,
      isFemaleOnly: ts.status === 'ladies' || femaleBookedSeatIds.has(ts.seatId),
    }));

  let layout;
  if (isSleeper) {
    const half       = Math.ceil(seatObjects.length / 2);
    const lowerSeats = seatObjects.slice(0, half);
    const upperSeats = seatObjects.slice(half);
    layout = {
      type:  'sleeper',
      lower: buildSleeperRows(lowerSeats),
      upper: buildSleeperRows(upperSeats),
    };
  } else {
    layout = {
      type:  'seater',
      lower: buildSeaterRows(seatObjects),
    };
  }

  return NextResponse.json({ layout, fare: trip.fare });
}
