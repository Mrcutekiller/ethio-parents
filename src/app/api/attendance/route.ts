import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/lib/models/AttendanceRecord';
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
    const classId = searchParams.get('class_id');
    const date = searchParams.get('date');
    const month = searchParams.get('month');

    const query: Record<string, unknown> = {};

    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ user_id: user._id.toString() });
      if (profile) query.student_id = profile._id.toString();
    } else if (user.role === 'parent') {
      const links = await ParentLink.find({ parent_id: user._id.toString() });
      query.student_id = { $in: links.map(l => l.student_id) };
    } else if (classId) {
      query.class_id = classId;
    }

    if (studentId) query.student_id = studentId;
    if (date) query.date = date;
    if (month) {
      const startDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const endDate = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
      query.date = { $gte: startDate, $lt: endDate };
    }

    const records = await AttendanceRecord.find(query).sort({ date: -1 });
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Get attendance error:', error);
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
    const { class_id, date, records } = body as {
      class_id: string;
      date: string;
      records: { student_id: string; status: 'present' | 'absent' | 'late' | 'excused' }[];
    };

    await connectDB();

    const notifications: { user_id: string; type: string; payload: Record<string, unknown> }[] = [];

    for (const record of records) {
      const existing = await AttendanceRecord.findOne({
        student_id: record.student_id,
        date,
      });

      if (existing) {
        existing.status = record.status;
        await existing.save();
      } else {
        await AttendanceRecord.create({
          student_id: record.student_id,
          class_id,
          date,
          status: record.status,
          marked_by: user._id.toString(),
        });
      }

      // Trigger notification for absent students
      if (record.status === 'absent') {
        const links = await ParentLink.find({ student_id: record.student_id });
        for (const link of links) {
          notifications.push({
            user_id: link.parent_id,
            type: 'absence',
            payload: { student_id: record.student_id, date, status: record.status },
          });
        }
      }
    }

    // Bulk create notifications
    if (notifications.length > 0) {
      await Notification.insertMany(
        notifications.map(n => ({ ...n, read: false, sent_at: new Date() }))
      );
    }

    return NextResponse.json({ success: true, notifications_sent: notifications.length });
  } catch (error) {
    console.error('Post attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
