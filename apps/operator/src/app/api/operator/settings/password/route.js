import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Operator } from '@nexabus/db';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Both passwords required' }, { status: 400 });
  if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  const op = await Operator.findById(operator._id).select('+password');
  const valid = await bcrypt.compare(currentPassword, op.password);
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  const hashed = await bcrypt.hash(newPassword, 10);
  await Operator.findByIdAndUpdate(operator._id, { $set: { password: hashed } });
  return NextResponse.json({ success: true });
}
