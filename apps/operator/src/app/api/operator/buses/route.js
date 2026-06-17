import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Bus } from '@nexabus/db';

export async function GET(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const busType = searchParams.get('busType') || '';
  const query = { operatorId: operator._id };
  if (status) query.status = status;
  if (busType) query.busType = busType;
  if (search) query.$or = [
    { busName: { $regex: search, $options: 'i' } },
    { busNumber: { $regex: search, $options: 'i' } },
  ];
  const buses = await Bus.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ buses });
}

export async function POST(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const { busName, busNumber, serviceNumber, busType, totalSeats, status, amenities, photos, boardingPoints, droppingPoints } = body;
  if (!busName?.trim()) return NextResponse.json({ error: 'Bus name is required' }, { status: 400 });
  if (!busNumber?.trim()) return NextResponse.json({ error: 'Bus number is required' }, { status: 400 });
  if (!busType) return NextResponse.json({ error: 'Bus type is required' }, { status: 400 });
  const bus = await Bus.create({
    operatorId: operator._id,
    busName: busName.trim(),
    busNumber: busNumber.trim().toUpperCase(),
    serviceNumber: serviceNumber?.trim() || '',
    busType,
    totalSeats: Number(totalSeats) || 0,
    status: status || 'active',
    amenities: amenities || [],
    photos: photos || [],
    boardingPoints: boardingPoints || [],
    droppingPoints: droppingPoints || [],
  });
  return NextResponse.json({ bus }, { status: 201 });
}
