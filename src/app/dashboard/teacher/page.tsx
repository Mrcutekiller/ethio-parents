"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Award, BookOpen, MessageSquare, Calendar, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface TeacherStats {
  classCount: number;
  studentCount: number;
  unreadMessages: number;
  recentGrades: number;
  upcomingQuizzes: number;
}

interface ClassInfo {
  _id: string;
  name: string;
  grade_level: number;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const token = localStorage.getItem("token");

    Promise.all([
      fetch("/api/teachers/profile", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/notifications?unread=true", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/quizzes", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([profileData, notifData, quizData]) => {
      const classList = profileData.classes || [];
      setClasses(classList);

      Promise.all(
        classList.map((cls: ClassInfo) =>
          fetch(`/api/students?class_id=${cls._id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
        )
      ).then((results) => {
        const totalStudents = results.reduce((sum: number, r: { students?: unknown[] }) => sum + (r.students?.length || 0), 0);
        const now = new Date();
        const upcoming = (quizData.quizzes || []).filter(
          (q: { due_date: string }) => new Date(q.due_date) > now
        ).length;

        setStats({
          classCount: classList.length,
          studentCount: totalStudents,
          unreadMessages: notifData.unreadCount || 0,
          recentGrades: 0,
          upcomingQuizzes: upcoming,
        });
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const quickActions = [
    { href: "/dashboard/teacher/attendance", label: "Take Attendance", icon: ClipboardCheck, gradient: "from-green-500 to-emerald-600", desc: "Mark today's attendance" },
    { href: "/dashboard/teacher/grades", label: "Enter Grades", icon: Award, gradient: "from-blue-500 to-indigo-600", desc: "Post student grades" },
    { href: "/dashboard/teacher/quizzes", label: "Create Quiz", icon: BookOpen, gradient: "from-purple-500 to-violet-600", desc: "Build secure online tests" },
    { href: "/dashboard/teacher/messages", label: "Messages", icon: MessageSquare, gradient: "from-amber-500 to-orange-600", desc: "Parent communications" },
    { href: "/dashboard/teacher/calendar", label: "Calendar", icon: Calendar, gradient: "from-teal-500 to-cyan-600", desc: "Manage class schedule" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome, {user?.name || "Teacher"}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your teaching overview for today</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-8 bg-gray-100 rounded mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.classCount ?? 0}</p>
                <p className="text-xs text-gray-500">Classes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.studentCount ?? 0}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.unreadMessages ?? 0}</p>
                <p className="text-xs text-gray-500">Unread</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.upcomingQuizzes ?? 0}</p>
                <p className="text-xs text-gray-500">Active Quizzes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all text-center group card-hover"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{action.label}</p>
            <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            My Classes
          </h2>
          {classes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No classes assigned yet. Contact Admin.</p>
          ) : (
            <div className="space-y-2">
              {classes.map((cls) => (
                <div key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center text-xs font-bold text-white">
                      G{cls.grade_level}
                    </div>
                    <span className="text-sm font-medium">{cls.name}</span>
                  </div>
                  <Link href={`/dashboard/teacher/attendance`} className="text-xs text-[var(--primary)] font-medium hover:underline">
                    Take Attendance
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Quick Reminders
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 text-base">&#8226;</span>
              Mark attendance daily — parents are notified of absences in real-time.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-base">&#8226;</span>
              Post grades promptly — students and parents receive instant notifications.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5 text-base">&#8226;</span>
              Use the quiz builder to create secure, proctored online assessments.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 text-base">&#8226;</span>
              Check messages regularly — parents can reach you about their child&apos;s progress.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
