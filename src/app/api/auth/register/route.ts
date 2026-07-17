import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['parent']).default('parent'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = registerSchema.parse(body);

    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password_hash,
      role: role || 'parent',
      status: 'active',
      firstLogin: false,
    });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
