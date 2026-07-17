import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import QuizAttempt from '@/lib/models/QuizAttempt';
import Assignment from '@/lib/models/Assignment';
import User from '@/lib/models/User';
import StudentProfile from '@/lib/models/StudentProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['teacher', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    // Verify quiz exists
    const quiz = await Assignment.findById(id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get all attempts for this quiz
    const attempts = await QuizAttempt.find({ test_id: id }).sort({ submitted_at: -1 });

    // Enrich with student names
    const enrichedAttempts = await Promise.all(
      attempts.map(async (attempt) => {
        const studentProfile = await StudentProfile.findById(attempt.student_id);
        let studentName = 'Unknown';
        if (studentProfile) {
          const studentUser = await User.findById(studentProfile.user_id).select('name');
          studentName = studentUser?.name || 'Unknown';
        }

        const durationSeconds = attempt.submitted_at && attempt.started_at
          ? Math.round((new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 1000)
          : null;

        const tabSwitches = (attempt.violations || []).filter(
          (v: { type: string }) => v.type === 'tab_switch'
        ).length;
        const fullscreenExits = (attempt.violations || []).filter(
          (v: { type: string }) => v.type === 'fullscreen_exit'
        ).length;

        return {
          _id: attempt._id.toString(),
          student_id: attempt.student_id,
          student_name: studentName,
          score: attempt.score,
          max_score: attempt.max_score,
          percentage: attempt.max_score > 0 ? Math.round((attempt.score / attempt.max_score) * 100) : 0,
          violations: attempt.violations || [],
          tab_switches: tabSwitches,
          fullscreen_exits: fullscreenExits,
          auto_submitted: attempt.auto_submitted,
          started_at: attempt.started_at,
          submitted_at: attempt.submitted_at,
          duration_seconds: durationSeconds,
        };
      })
    );

    return NextResponse.json({
      quiz: {
        _id: quiz._id.toString(),
        title: quiz.title,
        max_score: quiz.max_score,
        time_limit_minutes: quiz.time_limit_minutes,
        due_date: quiz.due_date,
      },
      attempts: enrichedAttempts,
      total_attempts: enrichedAttempts.length,
      avg_score: enrichedAttempts.length > 0
        ? Math.round(enrichedAttempts.reduce((s, a) => s + a.percentage, 0) / enrichedAttempts.length)
        : 0,
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
