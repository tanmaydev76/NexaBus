import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Traveller from '@/lib/models/Traveller';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const travellers = await Traveller.find({ userId: user._id })
      .sort({ isPrimary: -1, lastUsedAt: -1 })
      .lean();
    return NextResponse.json({ success: true, travellers, total: travellers.length });
  } catch (err) {
    console.error('[GET travellers]', err);
    return NextResponse.json({ error: 'Failed to fetch travellers' }, { status: 500 });
  }
}

export async function POST(req) {
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

    const count = await Traveller.countDocuments({ userId: user._id });
    if (count >= 10) {
      return NextResponse.json({ error: 'Maximum 10 travellers can be saved per account' }, { status: 400 });
    }

    // Check duplicate by mobile
    const existing = await Traveller.findOne({ userId: user._id, mobileNumber });
    if (existing) {
      return NextResponse.json({ error: 'A traveller with this mobile number already exists' }, { status: 409 });
    }

    if (isPrimary) {
      await Traveller.updateMany({ userId: user._id }, { isPrimary: false });
    }

    const traveller = await Traveller.create({
      userId: user._id,
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      mobileNumber,
      emailAddress: emailAddress || null,
      isPrimary: !!isPrimary,
    });

    return NextResponse.json({ success: true, traveller }, { status: 201 });
  } catch (err) {
    console.error('[POST traveller]', err);
    return NextResponse.json({ error: 'Failed to save traveller' }, { status: 500 });
  }
}
