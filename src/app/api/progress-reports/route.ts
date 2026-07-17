import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ProgressReport from '@/lib/models/ProgressReport';
import Grade from '@/lib/models/Grade';
import AttendanceRecord from '@/lib/models/AttendanceRecord';
import Subject from '@/lib/models/Subject';
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
    const term = searchParams.get('term');

    let query: Record<string, unknown> = {};
    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ user_id: user._id.toString() });
      if (profile) query.student_id = profile._id.toString();
    } else if (studentId) {
      query.student_id = studentId;
    }
    if (term) query.term = term;

    const reports = await ProgressReport.find(query).sort({ generated_at: -1 });
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get progress reports error:', error);
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
    const { student_id, term } = body;

    await connectDB();

    // Calculate attendance percentage
    const attendanceRecords = await AttendanceRecord.find({ student_id });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const attendance_percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Calculate grade averages by subject
    const grades = await Grade.find({ student_id, term });
    const subjectMap = new Map<string, number[]>();
    for (const grade of grades) {
      if (!subjectMap.has(grade.subject_id)) subjectMap.set(grade.subject_id, []);
      subjectMap.get(grade.subject_id)!.push((grade.score / grade.max_score) * 100);
    }

    const subject_grades: { subject: string; average: number }[] = [];
    let totalAverage = 0;
    for (const [subjectId, scores] of subjectMap) {
      const subject = await Subject.findById(subjectId);
      const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      subject_grades.push({ subject: subject?.name || subjectId, average });
      totalAverage += average;
    }

    const grade_average = subject_grades.length > 0
      ? Math.round(totalAverage / subject_grades.length)
      : 0;

    const report = await ProgressReport.create({
      student_id,
      term,
      generated_at: new Date(),
      summary_data: {
        attendance_percentage,
        attendance_present: presentDays,
        attendance_total: totalDays,
        grade_average,
        teacher_comments: body.teacher_comment || '',
        subject_grades,
      },
    });

    // Notify parents
    const links = await ParentLink.find({ student_id });
    const notifications = links.map(link => ({
      user_id: link.parent_id,
      type: 'progress_report',
      payload: { student_id, term, report_id: report._id.toString() },
      read: false,
      sent_at: new Date(),
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Return a UI-friendly shape
    const studentProfile = await StudentProfile.findById(student_id);
    const studentUser = studentProfile
      ? await (await import('@/lib/models/User')).default.findById(studentProfile.user_id).select('name')
      : null;

    return NextResponse.json({
      report,
      student_name: studentUser?.name || 'Unknown',
      student_id_code: studentProfile?.student_id || '',
      term,
      attendance_pct: attendance_percentage,
      attendance_present: presentDays,
      attendance_total: totalDays,
      grades_by_subject: subject_grades.map(sg => ({
        subject_name: sg.subject,
        average: sg.average,
        assignments: [],
      })),
      teacher_comment: body.teacher_comment || '',
      generated_at: report.generated_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Post progress report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
