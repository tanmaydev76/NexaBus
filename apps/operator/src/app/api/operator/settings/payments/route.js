import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Operator } from '@nexabus/db';

export async function PUT(req) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const allowed = ['accountName', 'bankName', 'accountNumber', 'ifscCode', 'upiId', 'razorpayKey'];
  const update = {};
  for (const k of allowed) if (body[k] !== undefined) update[`paymentSettings.${k}`] = body[k];
  const updated = await Operator.findByIdAndUpdate(operator._id, { $set: update }, { new: true }).lean();
  return NextResponse.json({ operator: updated });
}
