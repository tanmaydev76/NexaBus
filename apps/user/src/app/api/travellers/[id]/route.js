import { NextResponse } from 'next/server';

import { connectDB, Traveller } from '@nexabus/db';
import { requireAuth } from '@/lib/middleware/auth';

export async function PUT(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { fullName, age, gender, mobileNumber, emailAddress, isPrimary } = await req.json();

    if (!fullName?.trim() || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name must be at least 2 characters' }, { status: 400 });
    }
    if (!age || age < 1 || age > 120) {
      return NextResponse.json({ error: 'Age must be between 1 and 120' }, { status: 400 });
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
    }
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 });
    }

    await connectDB();

    const traveller = await Traveller.findOne({ _id: params.id, userId: user._id });
    if (!traveller) return NextResponse.json({ error: 'Traveller not found' }, { status: 404 });

    if (isPrimary) {
      await Traveller.updateMany({ userId: user._id, _id: { $ne: params.id } }, { isPrimary: false });
    }

    const updated = await Traveller.findByIdAndUpdate(
      params.id,
      { fullName: fullName.trim(), age: Number(age), gender, mobileNumber, emailAddress: emailAddress || null, isPrimary: !!isPrimary },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, traveller: updated });
  } catch (err) {
    console.error('[PUT traveller]', err);
    return NextResponse.json({ error: 'Failed to update traveller' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();

    const traveller = await Traveller.findOne({ _id: params.id, userId: user._id });
    if (!traveller) return NextResponse.json({ error: 'Traveller not found' }, { status: 404 });

    const wasPrimary = traveller.isPrimary;
    await Traveller.findByIdAndDelete(params.id);

    if (wasPrimary) {
      const next = await Traveller.findOne({ userId: user._id }).sort({ lastUsedAt: -1 });
      if (next) await Traveller.findByIdAndUpdate(next._id, { isPrimary: true });
    }

    return NextResponse.json({ success: true, message: 'Traveller deleted' });
  } catch (err) {
    console.error('[DELETE traveller]', err);
    return NextResponse.json({ error: 'Failed to delete traveller' }, { status: 500 });
  }
}
