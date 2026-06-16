import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

export async function PUT(req) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { name, phone, gender, dob } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      user._id,
      { name: name.trim(), phone, gender, dob },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      user: { id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, gender: updated.gender, dob: updated.dob },
    });
  } catch (err) {
    console.error('[profile update]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
