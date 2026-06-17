import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { connectDB, Operator, signToken } from '@nexabus/db';

export async function POST(req) {
  try {
    const { companyName, email, password, phone, gstNumber } = await req.json();

    if (!companyName?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!gstNumber?.trim()) {
      return NextResponse.json({ error: 'GST number is required' }, { status: 400 });
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.toUpperCase())) {
      return NextResponse.json({ error: 'Enter a valid 15-character GST number' }, { status: 400 });
    }

    await connectDB();

    const existing = await Operator.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const operator = await Operator.create({
      name: companyName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      companyName: companyName.trim(),
      gstNumber: gstNumber.toUpperCase().trim(),
    });

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
    }, { status: 201 });
  } catch (err) {
    console.error('[operator signup]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
