import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import StudentProfile from '@/lib/models/StudentProfile';
import TeacherProfile from '@/lib/models/TeacherProfile';
import { getAuthUser, hashPassword } from '@/lib/auth';
import { generateStudentId, generateVerificationCode, generateTempPassword } from '@/lib/utils';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['teacher', 'student']),
  class_id: z.string().optional(),
  subject_ids: z.array(z.string()).optional(),
  DOB: z.string().optional(),
  password: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const query = role ? { role } : {};
    const users = await User.find(query).select('-password_hash').sort({ createdAt: -1 });

    // Enrich with profile data
    const enriched = await Promise.all(users.map(async (u) => {
      const obj = u.toObject();
      if (u.role === 'student') {
        obj.profile = await StudentProfile.findOne({ user_id: u._id.toString() });
      } else if (u.role === 'teacher') {
        obj.profile = await TeacherProfile.findOne({ user_id: u._id.toString() });
      }
      return obj;
    }));

    return NextResponse.json({ users: enriched });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = createUserSchema.parse(body);

    await connectDB();

    // Check email uniqueness
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const tempPassword = data.password || generateTempPassword();
    const password_hash = await hashPassword(tempPassword);

    const newUser = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: data.role,
      password_hash,
      status: 'active',
      firstLogin: true,
    });

    let profileData: Record<string, unknown> = {};

    if (data.role === 'student') {
      const student_id = generateStudentId();
      const verification_code = generateVerificationCode();
      const profile = await StudentProfile.create({
        user_id: newUser._id.toString(),
        student_id,
        class_id: data.class_id,
        verification_code,
        DOB: data.DOB,
        admission_date: new Date(),
      });
      profileData = { student_id, verification_code, profile };
    } else if (data.role === 'teacher') {
      const profile = await TeacherProfile.create({
        user_id: newUser._id.toString(),
        assigned_classes: data.class_id ? [data.class_id] : [],
        assigned_subjects: data.subject_ids || [],
      });
      profileData = { profile };
    }

    return NextResponse.json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      tempPassword,
      ...profileData,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
