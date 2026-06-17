import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { connectDB, Operator, signToken } from '@nexabus/db';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    const operator = await Operator.findOne({ email: email.toLowerCase() }).select('+password');
    if (!operator || !(await bcrypt.compare(password, operator.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ id: operator._id.toString(), email: operator.email, role: 'operator' });

    cookies().set('op_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      operator: {
        id: operator._id,
        name: operator.name,
        email: operator.email,
        companyName: operator.companyName,
        phone: operator.phone,
        isVerified: operator.isVerified,
      },
    });
  } catch (err) {
    console.error('[operator login]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
