import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';
import { connectDB, Route } from '@nexabus/db';

export async function GET(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const route = await Route.findOne({ _id: params.id, operatorId: operator._id }).lean();
  if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  return NextResponse.json({ route });
}

export async function PUT(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const route = await Route.findOneAndUpdate(
    { _id: params.id, operatorId: operator._id },
    { $set: body },
    { new: true, runValidators: true }
  ).lean();
  if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  return NextResponse.json({ route });
}

export async function DELETE(req, { params }) {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  await connectDB();
  const route = await Route.findOneAndUpdate(
    { _id: params.id, operatorId: operator._id },
    { $set: { status: 'inactive' } },
    { new: true }
  ).lean();
  if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
