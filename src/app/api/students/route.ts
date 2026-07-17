import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import StudentProfile from '@/lib/models/StudentProfile';
import TeacherProfile from '@/lib/models/TeacherProfile';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['teacher', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');

    let classIds: string[] = [];

    if (user.role === 'teacher') {
      const teacherProfile = await TeacherProfile.findOne({ user_id: user._id.toString() });
      if (!teacherProfile) return NextResponse.json({ students: [] });
      classIds = teacherProfile.assigned_classes.map((id: unknown) => String(id));
    }

    if (classId) {
      // Validate teacher has access to this class
      if (user.role === 'teacher' && !classIds.includes(classId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      classIds = [classId];
    }

    const query: Record<string, unknown> = {};
    if (classIds.length > 0) query.class_id = { $in: classIds };

    const profiles = await StudentProfile.find(query);

    // Populate user names
    const students = await Promise.all(
      profiles.map(async (profile) => {
        const studentUser = await User.findById(profile.user_id).select('name email status');
        return {
          _id: profile._id.toString(),
          user_id: profile.user_id,
          student_id: profile.student_id,
          class_id: profile.class_id,
          verification_code: user.role === 'admin' ? profile.verification_code : undefined,
          name: studentUser?.name || 'Unknown',
          email: studentUser?.email || '',
          status: studentUser?.status || 'active',
        };
      })
    );

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
