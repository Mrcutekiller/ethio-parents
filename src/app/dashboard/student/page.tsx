"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Award, BookOpen, Calendar, TrendingUp, Clock } from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [recentGrades, setRecentGrades] = useState<{ assignment_name: string; score: number; max_score: number; posted_at: string }[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const token = localStorage.getItem("token");
    fetch("/api/grades", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setRecentGrades((data.grades || []).slice(0, 5)))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { href: "/dashboard/student/attendance", label: "My Attendance", icon: ClipboardCheck, gradient: "from-green-500 to-emerald-600" },
    { href: "/dashboard/student/grades", label: "My Grades", icon: Award, gradient: "from-blue-500 to-indigo-600" },
    { href: "/dashboard/student/tests", label: "Online Tests", icon: BookOpen, gradient: "from-purple-500 to-violet-600" },
    { href: "/dashboard/student/calendar", label: "Calendar", icon: Calendar, gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome, {user?.name || "Student"}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your academic overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all text-center group card-hover"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${link.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
              <link.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{link.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-[var(--foreground)]">Recent Grades</h2>
          </div>
          <div className="p-5">
            {recentGrades.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No grades posted yet</p>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((grade, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{grade.assignment_name}</p>
                      <p className="text-xs text-gray-500">{new Date(grade.posted_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-sm font-bold ${
                      (grade.score / grade.max_score) >= 0.7 ? "text-green-600" :
                      (grade.score / grade.max_score) >= 0.5 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {grade.score}/{grade.max_score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Today&apos;s Schedule
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-1 h-8 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium">Morning Assembly</p>
                <p className="text-xs text-gray-500">7:30 AM - 8:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-1 h-8 bg-[var(--primary)] rounded-full" />
              <div>
                <p className="text-sm font-medium">Classes</p>
                <p className="text-xs text-gray-500">8:00 AM - 12:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-1 h-8 bg-[var(--accent)] rounded-full" />
              <div>
                <p className="text-sm font-medium">Lunch Break</p>
                <p className="text-xs text-gray-500">12:00 PM - 1:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-1 h-8 bg-purple-500 rounded-full" />
              <div>
                <p className="text-sm font-medium">Afternoon Classes</p>
                <p className="text-xs text-gray-500">1:00 PM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
