import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Bus } from '@nexabus/db';

export async function PATCH(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const bus = await Bus.findOne({ _id: params.id, operatorId: operator._id });
  if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  bus.status = bus.status === 'active' ? 'inactive' : 'active';
  await bus.save();
  return NextResponse.json({ bus });
}
