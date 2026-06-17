import { NextResponse } from 'next/server';


import { connectDB, Booking, Traveller, Trip, TripSeat } from '@nexabus/db';
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

    // Link booking to operator (best-effort — never fails the booking)
    try {
      // busId from the client IS the trip._id (search API returns trip._id as bus.id)
      let trip = null;
      try { trip = await Trip.findById(busId).lean(); } catch {}
      if (!trip) {
        try { trip = await Trip.findOne({ busId, departureDate: date }).lean(); } catch {}
      }
      if (trip) {
        const seatIds = (seats || []).map((s) => s.id).filter(Boolean);
        if (seatIds.length > 0) {
          await TripSeat.updateMany(
            { tripId: trip._id, seatId: { $in: seatIds } },
            { $set: { status: 'booked', bookingId: booking._id } }
          );
        }
        await Booking.findByIdAndUpdate(booking._id, { operatorId: trip.operatorId, tripId: trip._id });
      }
    } catch (_) {}

    // Post-booking: update traveller stats and auto-save new travellers
    if (passengers && passengers.length > 0) {
      await Promise.allSettled(
        passengers.map(async (p) => {
          // Increment bookingCount on used saved travellers
          if (p.savedTravellerId) {
            await Traveller.findByIdAndUpdate(p.savedTravellerId, {
              $inc: { bookingCount: 1 },
              lastUsedAt: new Date(),
            });
          }

          // Auto-save new traveller if checkbox was checked
          if (p.saveTraveller && !p.savedTravellerId && p.name && p.mobile) {
            const count = await Traveller.countDocuments({ userId: user._id });
            if (count < 10) {
              const exists = await Traveller.findOne({ userId: user._id, mobileNumber: p.mobile });
              if (!exists) {
                await Traveller.create({
                  userId: user._id,
                  fullName: p.name,
                  age: Number(p.age) || 25,
                  gender: p.gender || 'Male',
                  mobileNumber: p.mobile,
                  emailAddress: p.email || null,
                  bookingCount: 1,
                  lastUsedAt: new Date(),
                });
              }
            }
          }
        })
      );
    }

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
