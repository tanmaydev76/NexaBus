import { NextResponse } from 'next/server';


import { connectDB, Booking, Traveller, Trip, TripSeat, Bus } from '@nexabus/db';
import { requireAuth } from '@/lib/middleware/auth';

function generateBookingId() {
  return 'NB' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Returns the seatId of the seat adjacent (same row, same pair) to the given seat.
// Sleeper: 3 seats/row — left solo (pos 0) has no pair; right pair is pos 1 & 2.
// Seater:  4 seats/row — left pair is pos 0 & 1; right pair is pos 2 & 3.
function getAdjacentSeatId(seatId, isSleeper) {
  const n = parseInt(seatId.replace(/\D/g, ''), 10);
  if (!n) return null;
  const seatsPerRow = isSleeper ? 3 : 4;
  const pos = (n - 1) % seatsPerRow;
  if (isSleeper) {
    if (pos === 0) return null;          // left solo
    if (pos === 1) return `S${n + 1}`;  // right-aisle → right-window
    if (pos === 2) return `S${n - 1}`;  // right-window → right-aisle
  } else {
    if (pos === 0) return `S${n + 1}`;  // left-window → left-aisle
    if (pos === 1) return `S${n - 1}`;  // left-aisle  → left-window
    if (pos === 2) return `S${n + 1}`;  // right-aisle → right-window
    if (pos === 3) return `S${n - 1}`;  // right-window → right-aisle
  }
  return null;
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

    // Resolve trip first — busId from the client IS the trip._id (search API returns trip._id as bus.id)
    let trip = null;
    try { trip = await Trip.findById(busId).lean(); } catch {}
    if (!trip) {
      try { trip = await Trip.findOne({ busId, departureDate: date }).lean(); } catch {}
    }

    const seatIds = (seats || []).map((s) => s.id).filter(Boolean);

    // Validate seat availability BEFORE creating the booking
    if (trip && seatIds.length > 0) {
      const takenCount = await TripSeat.countDocuments({
        tripId: trip._id,
        seatId: { $in: seatIds },
        status: { $in: ['booked', 'reserved', 'blocked'] },
      });
      if (takenCount > 0) {
        return NextResponse.json(
          { error: 'One or more selected seats are already booked. Please go back and choose different seats.' },
          { status: 409 }
        );
      }

      // Validate ladies-only seats: non-female passengers cannot book them
      const ladiesSeats = await TripSeat.find({
        tripId: trip._id,
        seatId: { $in: seatIds },
        status: 'ladies',
      }).lean();
      for (const ls of ladiesSeats) {
        const passenger = (passengers || []).find((p) => p.seatNumber === ls.seatNumber);
        if (passenger && passenger.gender !== 'Female') {
          return NextResponse.json(
            { error: `Seat ${ls.seatNumber} is reserved for female passengers only.` },
            { status: 409 }
          );
        }
      }
    }

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

    // Mark seats as booked and link to operator
    if (trip && seatIds.length > 0) {
      await TripSeat.updateMany(
        { tripId: trip._id, seatId: { $in: seatIds } },
        { $set: { status: 'booked', bookingId: booking._id } }
      );
      await Booking.findByIdAndUpdate(booking._id, { operatorId: trip.operatorId, tripId: trip._id });

      // Auto-mark the seat adjacent to each female passenger as ladies-only
      const bus = await Bus.findById(trip.busId).select('busType').lean();
      const isSleeper = (bus?.busType || '').toLowerCase().includes('sleeper');
      const femaleSeats = (passengers || [])
        .filter((p) => p.gender === 'Female')
        .map((p) => p.seatNumber)
        .filter(Boolean);
      if (femaleSeats.length > 0) {
        const adjacentIds = femaleSeats.map((sn) => getAdjacentSeatId(sn, isSleeper)).filter(Boolean);
        if (adjacentIds.length > 0) {
          await TripSeat.updateMany(
            { tripId: trip._id, seatId: { $in: adjacentIds }, status: 'available' },
            { $set: { status: 'ladies' } }
          );
        }
      }
    }

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
