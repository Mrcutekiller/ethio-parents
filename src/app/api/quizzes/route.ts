import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Assignment from '@/lib/models/Assignment';
import QuizAttempt from '@/lib/models/QuizAttempt';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const type = searchParams.get('type');

    const query: Record<string, unknown> = {};
    if (user.role === 'teacher' || user.role === 'admin') {
      query.teacher_id = user._id.toString();
    }
    if (subjectId) query.subject_id = subjectId;
    if (type) query.type = type;

    const quizzes = await Assignment.find(query).sort({ createdAt: -1 });

    // Strip correct answers for students
    if (user.role === 'student') {
      const sanitized = quizzes.map(q => {
        const obj = q.toObject();
        obj.questions = obj.questions.map((question: Record<string, unknown>) => {
          const { correct_answer, ...rest } = question;
          return rest;
        });
        return obj;
      });
      return NextResponse.json({ quizzes: sanitized });
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
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
    const { subject_id, type, title, description, due_date, questions, time_limit_minutes, randomized } = body;

    const max_score = questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0);

    await connectDB();
    const quiz = await Assignment.create({
      subject_id,
      teacher_id: user._id.toString(),
      type: type || 'quiz',
      title,
      description,
      due_date: new Date(due_date),
      questions,
      time_limit_minutes,
      max_score,
      randomized: randomized || false,
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Post quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
