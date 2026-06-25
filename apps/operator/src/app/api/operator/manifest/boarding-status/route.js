import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Booking } from '@nexabus/db';

const VALID_STATUSES = ['not_arrived', 'waiting', 'boarded', 'no_show'];

export async function PUT(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();

  const { bookingId, newStatus } = await req.json();
  if (!bookingId || !VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid bookingId or newStatus' }, { status: 400 });
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, operatorId: operator._id },
    { boardingStatus: newStatus, boardingStatusUpdatedAt: new Date() },
    { new: true },
  ).lean();
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    bookingMongoId: booking._id.toString(),
    boardingStatus: booking.boardingStatus,
    boardingStatusUpdatedAt: booking.boardingStatusUpdatedAt,
  });
}
