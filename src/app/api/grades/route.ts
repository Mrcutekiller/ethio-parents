import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Grade from '@/lib/models/Grade';
import StudentProfile from '@/lib/models/StudentProfile';
import ParentLink from '@/lib/models/ParentLink';
import Notification from '@/lib/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const subjectId = searchParams.get('subject_id');
    const term = searchParams.get('term');

    let query: Record<string, unknown> = {};

    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ user_id: user._id.toString() });
      if (profile) query.student_id = profile._id.toString();
    } else if (user.role === 'parent') {
      const links = await ParentLink.find({ parent_id: user._id.toString() });
      query.student_id = { $in: links.map(l => l.student_id) };
    }

    if (studentId) query.student_id = studentId;
    if (subjectId) query.subject_id = subjectId;
    if (term) query.term = term;

    const grades = await Grade.find(query).sort({ posted_at: -1 });
    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Get grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['teacher', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { grades } = body as {
      grades: {
        student_id: string;
        subject_id: string;
        term: string;
        assignment_name: string;
        score: number;
        max_score: number;
      }[];
    };

    await connectDB();

    const createdGrades = await Grade.insertMany(
      grades.map(g => ({
        ...g,
        posted_by: user._id.toString(),
        posted_at: new Date(),
      }))
    );

    // Send notifications
    const notifications: { user_id: string; type: string; payload: Record<string, unknown> }[] = [];
    for (const grade of grades) {
      const links = await ParentLink.find({ student_id: grade.student_id });
      for (const link of links) {
        notifications.push({
          user_id: link.parent_id,
          type: 'grade_posted',
          payload: { student_id: grade.student_id, assignment: grade.assignment_name, score: grade.score },
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(
        notifications.map(n => ({ ...n, read: false, sent_at: new Date() }))
      );
    }

    return NextResponse.json({ grades: createdGrades, notifications_sent: notifications.length }, { status: 201 });
  } catch (error) {
    console.error('Post grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
