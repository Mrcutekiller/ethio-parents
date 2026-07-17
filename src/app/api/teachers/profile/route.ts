import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeacherProfile from '@/lib/models/TeacherProfile';
import Class from '@/lib/models/Class';
import Subject from '@/lib/models/Subject';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['teacher', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const profile = await TeacherProfile.findOne({ user_id: user._id.toString() });
    if (!profile) {
      return NextResponse.json({ profile: null, classes: [], subjects: [] });
    }

    // Populate class names
    const classes = await Class.find({ _id: { $in: profile.assigned_classes } });
    // Populate subject names
    const subjects = await Subject.find({ _id: { $in: profile.assigned_subjects } });

    return NextResponse.json({ profile, classes, subjects });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
