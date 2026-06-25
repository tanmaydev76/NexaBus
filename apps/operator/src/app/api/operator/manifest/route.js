import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Trip, Booking, TripSeat } from '@nexabus/db';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const tripId        = searchParams.get('tripId');
  const boardingPoint = searchParams.get('boardingPoint') || '';
  const droppingPoint = searchParams.get('droppingPoint') || '';
  const bookingStatus = searchParams.get('bookingStatus') || '';
  const search        = searchParams.get('search')?.trim() || '';

  if (!tripId) return NextResponse.json({ error: 'tripId is required' }, { status: 400 });

  const trip = await Trip.findOne({ _id: tripId, operatorId: operator._id })
    .populate('busId', 'busName busNumber busType totalSeats')
    .populate('routeId', 'routeName origin destination')
    .lean();
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

  const bus   = trip.busId;
  const route = trip.routeId;

  const query = { tripId: trip._id, operatorId: operator._id };
  if (bookingStatus) query.status = bookingStatus;
  else query.status = { $ne: 'cancelled' };
  if (boardingPoint) query.boardingPoint = boardingPoint;
  if (droppingPoint) query.droppingPoint = droppingPoint;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    query.$or = [{ 'passengers.name': rx }, { 'passengers.mobile': rx }];
  }

  const [bookings, allBookingsForTrip, tripSeats] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).lean(),
    // Unfiltered set, used to derive boarding/dropping options + stats that shouldn't shrink with the search box
    Booking.find({ tripId: trip._id, operatorId: operator._id, status: { $ne: 'cancelled' } }).lean(),
    TripSeat.find({ tripId: trip._id }).lean(),
  ]);

  const passengers = [];
  for (const booking of bookings) {
    for (const p of booking.passengers || []) {
      passengers.push({
        bookingId: booking.bookingId,
        bookingMongoId: booking._id.toString(),
        seatNumber: p.seatNumber,
        name: p.name,
        age: p.age,
        gender: p.gender,
        mobile: p.mobile,
        email: p.email,
        boardingPoint: booking.boardingPoint,
        droppingPoint: booking.droppingPoint,
        departure: booking.departure,
        arrival: booking.arrival,
        fare: booking.passengers.length ? Math.round(booking.total / booking.passengers.length) : booking.total,
        paymentStatus: 'paid',
        bookingStatus: booking.status,
        boardingStatus: booking.boardingStatus,
        boardingStatusUpdatedAt: booking.boardingStatusUpdatedAt,
        specialNotes: booking.specialNotes,
        luggageInfo: booking.luggageInfo,
        couponCode: booking.couponCode,
        createdAt: booking.createdAt,
        baseFare: booking.baseFare,
        tax: booking.tax,
        serviceFee: booking.serviceFee,
        discount: booking.discount,
        total: booking.total,
      });
    }
  }

  const stats = {
    totalPassengers: passengers.length,
    boarded:    passengers.filter((p) => p.boardingStatus === 'boarded').length,
    waiting:    passengers.filter((p) => p.boardingStatus === 'waiting').length,
    noShow:     passengers.filter((p) => p.boardingStatus === 'no_show').length,
    notArrived: passengers.filter((p) => p.boardingStatus === 'not_arrived').length,
  };

  const totalSeats   = bus?.totalSeats || 0;
  const bookedSeats  = tripSeats.filter((s) => s.status === 'booked').length;
  const availableSeats = Math.max(totalSeats - bookedSeats, 0);
  const revenue = allBookingsForTrip.reduce((sum, b) => sum + (b.total || 0), 0);

  const boardingPoints = [...new Set(allBookingsForTrip.map((b) => b.boardingPoint).filter(Boolean))];
  const droppingPoints = [...new Set(allBookingsForTrip.map((b) => b.droppingPoint).filter(Boolean))];

  const tripSummary = {
    route: route ? `${route.origin} → ${route.destination}` : '',
    routeName: route?.routeName || '',
    busName: bus?.busName || '',
    busNumber: bus?.busNumber || '',
    busType: bus?.busType || '',
    departureDate: trip.departureDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    totalSeats,
    bookedSeats,
    availableSeats,
    occupancyPercent: totalSeats ? Math.round((bookedSeats / totalSeats) * 100) : 0,
    revenue,
    boardingPoints,
    droppingPoints,
  };

  return NextResponse.json({ success: true, tripSummary, stats, passengers });
}
