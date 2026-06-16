import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

export async function PUT(req) {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();
    const dbUser = await User.findById(user._id).select('+password');
    if (!(await dbUser.comparePassword(currentPassword))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    dbUser.password = newPassword;
    await dbUser.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[change-password]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
