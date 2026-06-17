import { NextResponse } from 'next/server';

import { connectDB, Traveller } from '@nexabus/db';
import { requireAuth } from '@/lib/middleware/auth';

export async function PUT(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();

    const traveller = await Traveller.findOne({ _id: params.id, userId: user._id });
    if (!traveller) return NextResponse.json({ error: 'Traveller not found' }, { status: 404 });

    await Traveller.updateMany({ userId: user._id }, { isPrimary: false });
    await Traveller.findByIdAndUpdate(params.id, { isPrimary: true });

    const travellers = await Traveller.find({ userId: user._id })
      .sort({ isPrimary: -1, lastUsedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, travellers });
  } catch (err) {
    console.error('[set-primary]', err);
    return NextResponse.json({ error: 'Failed to set primary' }, { status: 500 });
  }
}
