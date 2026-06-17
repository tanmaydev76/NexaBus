import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Booking } from '@nexabus/db';

export async function GET(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 20;

  const query = { operatorId: operator._id };
  if (status) query.status = status;
  if (from && to) query.date = { $gte: from, $lte: to };
  else if (from) query.date = { $gte: from };
  else if (to) query.date = { $lte: to };
  if (search) query.$or = [
    { bookingId: { $regex: search, $options: 'i' } },
    { 'passengers.name': { $regex: search, $options: 'i' } },
  ];

  const [bookings, total] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Booking.countDocuments(query),
  ]);
  return NextResponse.json({ bookings, total, page, pages: Math.ceil(total / limit) });
}
