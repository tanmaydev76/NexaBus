import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { connectDB, User } from '@nexabus/db';
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
    if (!(await bcrypt.compare(currentPassword, dbUser.password))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedNew });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[change-password]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
