import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Bus } from '@nexabus/db';

export async function GET(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const bus = await Bus.findOne({ _id: params.id, operatorId: operator._id }).lean();
  if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  return NextResponse.json({ bus });
}

export async function PUT(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const bus = await Bus.findOneAndUpdate(
    { _id: params.id, operatorId: operator._id },
    { $set: body },
    { new: true, runValidators: true }
  ).lean();
  if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  return NextResponse.json({ bus });
}

export async function DELETE(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const bus = await Bus.findOneAndDelete({ _id: params.id, operatorId: operator._id });
  if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
