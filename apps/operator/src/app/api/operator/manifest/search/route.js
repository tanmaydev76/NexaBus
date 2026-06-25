import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Booking } from '@nexabus/db';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  if (q.length < 3) return NextResponse.json({ results: [] });

  const rx = new RegExp(escapeRegex(q), 'i');
  const bookings = await Booking.find({
    operatorId: operator._id,
    $or: [{ 'passengers.name': rx }, { 'passengers.mobile': rx }],
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const results = bookings.map((b) => ({
    bookingId: b.bookingId,
    bookingMongoId: b._id.toString(),
    tripId: b.tripId ? b.tripId.toString() : null,
    busName: b.busName,
    date: b.date,
    from: b.from,
    to: b.to,
    matchedPassengers: (b.passengers || [])
      .filter((p) => rx.test(p.name) || rx.test(p.mobile))
      .map((p) => ({ name: p.name, mobile: p.mobile, seatNumber: p.seatNumber })),
  }));

  return NextResponse.json({ results });
}
