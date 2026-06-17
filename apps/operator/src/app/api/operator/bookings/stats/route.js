import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Booking } from '@nexabus/db';

export async function GET() {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  await connectDB();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const last7Start = new Date(todayStart);
  last7Start.setDate(last7Start.getDate() - 6);

  const baseMatch = { operatorId: operator._id };

  const [totalBookings, cancelledCount, todayBookings, revenueAgg, passAgg, last7Agg, genderAgg, routeAgg] =
    await Promise.all([
      Booking.countDocuments(baseMatch),
      Booking.countDocuments({ ...baseMatch, status: 'cancelled' }),
      Booking.countDocuments({ ...baseMatch, createdAt: { $gte: todayStart } }),

      Booking.aggregate([
        { $match: { ...baseMatch, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),

      Booking.aggregate([
        { $match: baseMatch },
        { $project: { passengerCount: { $size: { $ifNull: ['$passengers', []] } } } },
        { $group: { _id: null, total: { $sum: '$passengerCount' } } },
      ]),

      Booking.aggregate([
        { $match: { ...baseMatch, createdAt: { $gte: last7Start } } },
        {
          $group: {
            _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count:   { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Booking.aggregate([
        { $match: baseMatch },
        { $unwind: { path: '$passengers', preserveNullAndEmpty: false } },
        { $group: { _id: '$passengers.gender', count: { $sum: 1 } } },
        { $project: { gender: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      Booking.aggregate([
        { $match: { ...baseMatch, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id:     { from: '$from', to: '$to' },
            count:   { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        { $project: { from: '$_id.from', to: '$_id.to', count: 1, revenue: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

  // Fill all 7 days so the chart has no gaps
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d  = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const found = last7Agg.find((a) => a._id === ds);
    last7Days.push({ date: ds, count: found?.count || 0, revenue: found?.revenue || 0 });
  }

  return NextResponse.json({
    totalBookings,
    todayBookings,
    totalPassengers:   passAgg[0]?.total   || 0,
    totalRevenue:      revenueAgg[0]?.total || 0,
    cancelledCount,
    last7Days,
    genderBreakdown:   genderAgg,
    routeWise:         routeAgg,
  });
}
