import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Trip } from '@nexabus/db';

export async function DELETE(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const trip = await Trip.findOneAndDelete({ _id: id, operatorId: operator._id });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
