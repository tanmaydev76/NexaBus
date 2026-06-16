import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import { requireAuth } from '@/lib/middleware/auth';

export async function PUT(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const booking = await Booking.findOne({
      bookingId: params.bookingId,
      userId: user._id,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('[cancel booking]', err);
    return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 });
  }
}
