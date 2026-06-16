import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/lib/models/Booking';
import { requireAuth } from '@/lib/middleware/auth';

function generateBookingId() {
  return 'NB' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

export async function POST(req) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const body = await req.json();
    const {
      busId, busName, busType, from, to, date,
      departure, arrival, boardingPoint, droppingPoint,
      seats, passengers, baseFare, tax, serviceFee,
      discount, total, couponCode,
    } = body;

    if (!busId || !from || !to || !date || !baseFare || !total) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    await connectDB();
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      userId: user._id,
      bookingId,
      busId, busName, busType, from, to, date,
      departure, arrival, boardingPoint, droppingPoint,
      seats, passengers, baseFare, tax, serviceFee,
      discount: discount || 0,
      total, couponCode: couponCode || '',
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error('[create booking]', err);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const bookings = await Booking.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error('[get bookings]', err);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
