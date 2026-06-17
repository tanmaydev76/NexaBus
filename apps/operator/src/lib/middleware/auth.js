import { cookies } from 'next/headers';
import { verifyToken, Operator, connectDB } from '@nexabus/db';

export async function requireOperatorAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('op_token')?.value;
  if (!token) return { operator: null, error: 'Unauthorized' };

  const decoded = verifyToken(token);
  if (!decoded) return { operator: null, error: 'Invalid token' };

  await connectDB();
  const operator = await Operator.findById(decoded.id).lean();
  if (!operator) return { operator: null, error: 'Operator not found' };

  return { operator, error: null };
}
