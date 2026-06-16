import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Traveller from '@/lib/models/Traveller';
import { requireAuth } from '@/lib/middleware/auth';

export async function PUT(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    await Traveller.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      { $inc: { bookingCount: 1 }, lastUsedAt: new Date() }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[traveller used]', err);
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
  }
}
