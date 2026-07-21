"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Award, BookOpen, MessageSquare, Calendar, Users, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

interface TeacherStats {
  classCount: number;
  studentCount: number;
  unreadMessages: number;
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
          fetch(`/api/students?class_id=${cls._id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
        )
      ).then((results) => {
        const totalStudents = results.reduce((sum: number, r: { students?: unknown[] }) => sum + (r.students?.length || 0), 0);
        const now = new Date();
        const upcoming = (quizData.quizzes || []).filter((q: { due_date: string }) => new Date(q.due_date) > now).length;
        setStats({ classCount: classList.length, studentCount: totalStudents, unreadMessages: notifData.unreadCount || 0, upcomingQuizzes: upcoming });
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const quickActions = [
    { href: "/dashboard/teacher/attendance", label: "Attendance", icon: ClipboardCheck, gradient: "from-green-500 to-emerald-600", shadow: "shadow-emerald-500/20", desc: "Mark today's attendance" },
    { href: "/dashboard/teacher/grades", label: "Grades", icon: Award, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20", desc: "Post student grades" },
    { href: "/dashboard/teacher/quizzes", label: "Online Tests", icon: BookOpen, gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/20", desc: "Build secure quizzes" },
    { href: "/dashboard/teacher/messages", label: "Messages", icon: MessageSquare, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", desc: "Parent communications" },
    { href: "/dashboard/teacher/calendar", label: "Calendar", icon: Calendar, gradient: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/20", desc: "Manage class schedule" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome, {user?.name || "Teacher"}!</h1>
            <p className="text-white/60 text-sm">Here&apos;s your teaching overview for today</p>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
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
          {[
            { label: "Classes", value: stats?.classCount ?? 0, icon: Users, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20" },
            { label: "Students", value: stats?.studentCount ?? 0, icon: TrendingUp, gradient: "from-green-500 to-emerald-600", shadow: "shadow-emerald-500/20" },
            { label: "Unread", value: stats?.unreadMessages ?? 0, icon: MessageSquare, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
            { label: "Active Tests", value: stats?.upcomingQuizzes ?? 0, icon: BookOpen, gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/20" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-glow group">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[var(--foreground)]">{card.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-glow text-center group">
            <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{action.label}</p>
            <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Classes + Tips */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-glow">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="font-semibold text-sm text-[var(--foreground)]">My Classes</h2>
            </div>
            <Link href="/dashboard/teacher/attendance" className="text-xs text-[var(--primary)] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Take Attendance <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5">
            {classes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No classes assigned yet. Contact Admin.</p>
            ) : (
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        G{cls.grade_level}
                      </div>
                      <span className="text-sm font-medium">{cls.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Quick Reminders</h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              { color: "bg-green-500", text: "Mark attendance daily — parents are notified of absences in real-time." },
              { color: "bg-[var(--primary)]", text: "Post grades promptly — students and parents receive instant notifications." },
              { color: "bg-purple-500", text: "Use the quiz builder to create secure, proctored online assessments." },
              { color: "bg-amber-500", text: "Check messages regularly — parents can reach you about their child's progress." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`w-2 h-2 ${item.color} rounded-full mt-1.5 flex-shrink-0`} />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
