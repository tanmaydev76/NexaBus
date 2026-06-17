import { cookies } from 'next/headers';


import { verifyToken, User, connectDB } from '@nexabus/db';

export async function requireAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('nb_token')?.value;
  if (!token) return { user: null, error: 'Unauthorized' };

  const decoded = verifyToken(token);
  if (!decoded) return { user: null, error: 'Invalid token' };

  await connectDB();
  const user = await User.findById(decoded.id).lean();
  if (!user) return { user: null, error: 'User not found' };

  return { user, error: null };
}
