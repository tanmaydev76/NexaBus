import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Trip, Bus, Route } from '@nexabus/db';

export async function GET(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const range = searchParams.get('range') || '';
  const date = searchParams.get('date') || '';
  const query = { operatorId: operator._id };
  if (status) query.status = status;
  if (date) {
    query.departureDate = date;
  } else if (range === 'today') {
    const today = new Date().toISOString().split('T')[0];
    query.departureDate = today;
  } else if (range === 'week') {
    const now = new Date();
    const start = now.toISOString().split('T')[0];
    const end = new Date(now.setDate(now.getDate() + 7)).toISOString().split('T')[0];
    query.departureDate = { $gte: start, $lte: end };
  } else if (range === 'month') {
    const now = new Date();
    const start = now.toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    query.departureDate = { $gte: start, $lte: end };
  }
  const trips = await Trip.find(query)
    .populate('busId', 'busName busNumber')
    .populate('routeId', 'routeName origin destination')
    .sort({ departureDate: -1 })
    .lean();
  return NextResponse.json({ trips });
}

export async function POST(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const { busId, routeId, departureDate, departureTime, arrivalTime, fare, recurringDays, repeatUntil, notes } = body;
  if (!busId) return NextResponse.json({ error: 'Bus is required' }, { status: 400 });
  if (!routeId) return NextResponse.json({ error: 'Route is required' }, { status: 400 });
  if (!departureDate) return NextResponse.json({ error: 'Departure date is required' }, { status: 400 });
  if (!departureTime) return NextResponse.json({ error: 'Departure time is required' }, { status: 400 });
  if (!fare) return NextResponse.json({ error: 'Fare is required' }, { status: 400 });

  const [bus, route] = await Promise.all([
    Bus.findOne({ _id: busId, operatorId: operator._id }),
    Route.findOne({ _id: routeId, operatorId: operator._id }),
  ]);
  if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });

  const tripData = {
    operatorId: operator._id,
    busId,
    routeId,
    layoutId: busId,
    departureDate,
    departureTime,
    arrivalTime: arrivalTime || '',
    fare: Number(fare),
    status: 'scheduled',
  };

  if (recurringDays?.length && repeatUntil) {
    const trips = [];
    const start = new Date(departureDate);
    const end = new Date(repeatUntil);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (recurringDays.includes(dayNames[d.getDay()])) {
        trips.push({ ...tripData, departureDate: d.toISOString().split('T')[0], recurringDays });
      }
    }
    if (!trips.length) return NextResponse.json({ error: 'No matching days in range' }, { status: 400 });
    const created = await Trip.insertMany(trips);
    return NextResponse.json({ trips: created, count: created.length }, { status: 201 });
  }

  const trip = await Trip.create(tripData);
  return NextResponse.json({ trip }, { status: 201 });
}
