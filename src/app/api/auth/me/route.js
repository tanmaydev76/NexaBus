import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ user });
}
