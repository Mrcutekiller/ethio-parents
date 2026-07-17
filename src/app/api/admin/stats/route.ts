import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import AttendanceRecord from '@/lib/models/AttendanceRecord';
import Grade from '@/lib/models/Grade';
import StudentProfile from '@/lib/models/StudentProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const [totalTeachers, totalStudents, totalParents, totalAdmins] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    // School-wide attendance percentage
    const allAttendance = await AttendanceRecord.find({});
    const totalRecords = allAttendance.length;
    const presentCount = allAttendance.filter(a => a.status === 'present').length;
    const schoolAttendance = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    // School-wide grade average
    const allGrades = await Grade.find({});
    const avgGrade = allGrades.length > 0
      ? Math.round(allGrades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / allGrades.length)
      : 0;

    // Recent activity
    const recentUsers = await User.find({}).select('name role createdAt').sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: totalTeachers + totalStudents + totalParents + totalAdmins,
        totalTeachers,
        totalStudents,
        totalParents,
        totalAdmins,
        schoolAttendance,
        avgGrade,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
