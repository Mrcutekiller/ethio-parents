"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Award, BookOpen, Calendar, TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [recentGrades, setRecentGrades] = useState<{ assignment_name: string; score: number; max_score: number; posted_at: string }[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const token = localStorage.getItem("token");
    fetch("/api/grades", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setRecentGrades((data.grades || []).slice(0, 5)))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { href: "/dashboard/student/attendance", label: "Attendance", icon: ClipboardCheck, gradient: "from-green-500 to-emerald-600", shadow: "shadow-emerald-500/20" },
    { href: "/dashboard/student/grades", label: "Grades", icon: Award, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20" },
    { href: "/dashboard/student/tests", label: "Online Tests", icon: BookOpen, gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/20" },
    { href: "/dashboard/student/calendar", label: "Calendar", icon: Calendar, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome, {user?.name || "Student"}!</h1>
            <p className="text-white/60 text-sm">Here&apos;s your academic overview</p>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-glow text-center group">
            <div className={`w-12 h-12 bg-gradient-to-br ${link.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg ${link.shadow} group-hover:scale-110 transition-transform duration-300`}>
              <link.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{link.label}</p>
          </Link>
        ))}
      </div>

      {/* Grades + Schedule */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-glow">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="font-semibold text-sm text-[var(--foreground)]">Recent Grades</h2>
            </div>
            <Link href="/dashboard/student/grades" className="text-xs text-[var(--primary)] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5">
            {recentGrades.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No grades posted yet</p>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((grade, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{grade.assignment_name}</p>
                      <p className="text-xs text-gray-500">{new Date(grade.posted_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        (grade.score / grade.max_score) >= 0.7 ? "text-green-600" :
                        (grade.score / grade.max_score) >= 0.5 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {grade.score}/{grade.max_score}
                      </span>
                      <div className={`w-1.5 h-8 rounded-full ${
                        (grade.score / grade.max_score) >= 0.7 ? "bg-green-400" :
                        (grade.score / grade.max_score) >= 0.5 ? "bg-amber-400" : "bg-red-400"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Today&apos;s Schedule</h2>
          </div>
          <div className="space-y-2">
            {[
              { time: "7:30 AM", label: "Morning Assembly", color: "bg-green-500" },
              { time: "8:00 AM", label: "Classes", color: "bg-[var(--primary)]" },
              { time: "12:00 PM", label: "Lunch Break", color: "bg-[var(--accent)]" },
              { time: "1:00 PM", label: "Afternoon Classes", color: "bg-purple-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-1 h-10 ${item.color} rounded-full`} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
