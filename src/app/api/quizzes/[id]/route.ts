import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Assignment from '@/lib/models/Assignment';
import QuizAttempt from '@/lib/models/QuizAttempt';
import StudentProfile from '@/lib/models/StudentProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const quiz = await Assignment.findById(id);
    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

    const obj = quiz.toObject();
    if (user.role === 'student') {
      obj.questions = obj.questions.map((q: Record<string, unknown>) => {
        const { correct_answer, ...rest } = q;
        return rest;
      });
    }

    // Get attempts if teacher/admin
    let attempts: unknown[] = [];
    if (user.role !== 'student') {
      attempts = await QuizAttempt.find({ test_id: id }).sort({ submitted_at: -1 });
    }

    return NextResponse.json({ quiz: obj, attempts });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit quiz attempts' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answers, violations, auto_submitted } = body;

    await connectDB();

    const quiz = await Assignment.findById(id);
    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

    const profile = await StudentProfile.findOne({ user_id: user._id.toString() });
    if (!profile) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

    // Grade server-side
    let score = 0;
    for (const answer of answers) {
      const question = quiz.questions[answer.question_index];
      if (question && question.correct_answer.toLowerCase() === answer.answer.toLowerCase()) {
        score += question.points;
      }
    }

    const attempt = await QuizAttempt.create({
      test_id: id,
      student_id: profile._id.toString(),
      answers,
      score,
      max_score: quiz.max_score,
      violations: violations || [],
      started_at: new Date(),
      submitted_at: new Date(),
      auto_submitted: auto_submitted || false,
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    console.error('Post quiz attempt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
