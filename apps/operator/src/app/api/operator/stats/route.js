import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Bus, Trip, TripSeat, Booking } from '@nexabus/db';

export async function GET() {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  await connectDB();
  const operatorId = operator._id;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Get all trip IDs for this operator (for occupancy calculation)
  const tripIds = await Trip.find({ operatorId }).distinct('_id');

  const [
    totalBuses,
    activeTrips,
    todayAgg,
    monthlyAgg,
    dailyRevenueAgg,
    recentBookings,
    totalSeats,
    bookedSeats,
  ] = await Promise.all([
    Bus.countDocuments({ operatorId }),
    Trip.countDocuments({ operatorId, status: { $in: ['scheduled', 'active'] } }),
    Booking.aggregate([
      { $match: { operatorId, status: 'confirmed', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]),
    Booking.aggregate([
      { $match: { operatorId, status: 'confirmed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]),
    Booking.aggregate([
      { $match: { operatorId, status: 'confirmed', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Booking.find({ operatorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    TripSeat.countDocuments({ tripId: { $in: tripIds } }),
    TripSeat.countDocuments({ tripId: { $in: tripIds }, status: 'booked' }),
  ]);

  // Build 30-day chart array (fill missing days with 0)
  const revenueMap = {};
  dailyRevenueAgg.forEach((d) => { revenueMap[d._id] = d.revenue; });
  const dailyRevenue = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dailyRevenue.push({ date: label, revenue: revenueMap[key] || 0 });
  }

  const today = todayAgg[0] || { count: 0, revenue: 0 };
  const monthly = monthlyAgg[0] || { revenue: 0 };
  const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  return NextResponse.json({
    totalBuses,
    activeTrips,
    todayBookings: today.count,
    todayRevenue: today.revenue,
    monthlyRevenue: monthly.revenue,
    occupancyRate,
    dailyRevenue,
    recentBookings,
  });
}
