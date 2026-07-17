import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import StudentProfile from '@/lib/models/StudentProfile';
import ParentLink from '@/lib/models/ParentLink';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';


const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can link children' }, { status: 403 });
    }

    const body = await request.json();
    const { verification_code, relationship } = body;

    if (!verification_code || !relationship) {
      return NextResponse.json({ error: 'Verification code and relationship are required' }, { status: 400 });
    }

    await connectDB();

    // Find student by verification code
    const studentProfile = await StudentProfile.findOne({ verification_code: verification_code.toUpperCase() });
    if (!studentProfile) {
      return NextResponse.json({ error: 'Invalid verification code. Please check the code and try again.' }, { status: 404 });
    }

    // Check if already linked
    const existingLink = await ParentLink.findOne({
      parent_id: user._id.toString(),
      student_id: studentProfile._id.toString(),
    });
    if (existingLink) {
      return NextResponse.json({ error: 'This child is already linked to your account' }, { status: 409 });
    }

    // Rate limiting check
    const recentFailedAttempts = await ParentLink.findOne({
      parent_id: user._id.toString(),
      student_id: studentProfile._id.toString(),
      code_attempts: { $gte: MAX_ATTEMPTS },
      last_attempt_at: { $gte: new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000) },
    });

    if (recentFailedAttempts) {
      return NextResponse.json({
        error: `Too many failed attempts. Please try again in ${LOCKOUT_MINUTES} minutes.`,
      }, { status: 429 });
    }

    // Create link
    const link = await ParentLink.create({
      parent_id: user._id.toString(),
      student_id: studentProfile._id.toString(),
      relationship,
      verified_at: new Date(),
      code_attempts: 0,
    });

    return NextResponse.json({
      link,
      message: 'Child linked successfully!',
    }, { status: 201 });
  } catch (error) {
    console.error('Link parent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const links = await ParentLink.find({ parent_id: user._id.toString() });

    // Enrich with student info + user name
    const enriched = await Promise.all(links.map(async (link) => {
      const profile = await StudentProfile.findById(link.student_id);
      let studentName = 'Unknown Student';
      let studentClass = '';
      if (profile) {
        const studentUser = await User.findById(profile.user_id).select('name');
        studentName = studentUser?.name || 'Unknown Student';
        studentClass = profile.class_id || '';
      }
      return {
        ...link.toObject(),
        student_profile: profile,
        student_name: studentName,
        student_class: studentClass,
      };
    }));

    return NextResponse.json({ links: enriched });
  } catch (error) {
    console.error('Get parent links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
