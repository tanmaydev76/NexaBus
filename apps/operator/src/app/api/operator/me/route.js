import { NextResponse } from 'next/server';
import { requireOperatorAuth } from '@/lib/middleware/auth';

export async function GET() {
  const { operator, error } = await requireOperatorAuth();
  if (error) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ operator });
}
