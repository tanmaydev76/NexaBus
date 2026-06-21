import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Route } from '@nexabus/db';

export async function GET(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const query = { operatorId: operator._id };
  if (status) query.status = status;
  if (search) query.$or = [
    { routeName: { $regex: search, $options: 'i' } },
    { origin: { $regex: search, $options: 'i' } },
    { destination: { $regex: search, $options: 'i' } },
  ];
  const routes = await Route.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ routes });
}

export async function POST(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const { routeName, routeNumber, origin, destination, distance, estimatedDuration, stops, status, boardingPoints, droppingPoints } = body;
  if (!routeName?.trim()) return NextResponse.json({ error: 'Route name is required' }, { status: 400 });
  if (!origin?.trim()) return NextResponse.json({ error: 'Origin is required' }, { status: 400 });
  if (!destination?.trim()) return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
  const route = await Route.create({
    operatorId: operator._id,
    routeName: routeName.trim(),
    routeNumber: routeNumber?.trim() || '',
    origin: origin.trim(),
    destination: destination.trim(),
    distance: Number(distance) || 0,
    estimatedDuration: estimatedDuration?.trim() || '',
    stops: (stops || []).filter((s) => s.name?.trim()),
    boardingPoints: (boardingPoints || []).filter((p) => p.name?.trim()),
    droppingPoints: (droppingPoints || []).filter((p) => p.name?.trim()),
    status: status || 'active',
  });
  return NextResponse.json({ route }, { status: 201 });
}
