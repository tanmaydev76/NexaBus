import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const booking = await Booking.findOne({
      bookingId: params.bookingId,
      userId: user._id,
    }).lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('[get booking]', err);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
