import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';


import { connectDB, User, signToken } from '@nexabus/db';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });

    cookies().set('nb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, gender: user.gender, dob: user.dob },
    });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
