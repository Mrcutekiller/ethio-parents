"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  UserCheck,
  ClipboardCheck,
  Award,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalParents: number;
    totalAdmins: number;
    schoolAttendance: number;
    avgGrade: number;
  } | null>(null);
  const [recentUsers, setRecentUsers] = useState<{ name: string; role: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, gradient: "from-[var(--primary)] to-blue-600" },
    { label: "Teachers", value: stats?.totalTeachers || 0, icon: GraduationCap, gradient: "from-blue-500 to-indigo-600" },
    { label: "Students", value: stats?.totalStudents || 0, icon: UserCheck, gradient: "from-green-500 to-emerald-600" },
    { label: "Parents", value: stats?.totalParents || 0, icon: Users, gradient: "from-amber-500 to-orange-600" },
    { label: "Attendance %", value: `${stats?.schoolAttendance || 0}%`, icon: ClipboardCheck, gradient: "from-teal-500 to-cyan-600" },
    { label: "Avg Grade", value: `${stats?.avgGrade || 0}%`, icon: Award, gradient: "from-purple-500 to-violet-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of school-wide metrics and activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-[var(--foreground)]">Recent Users</h2>
          </div>
          <div className="p-5">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center text-sm font-bold text-white">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-[var(--foreground)]">Quick Actions</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <a
              href="/dashboard/admin/users"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-center group"
            >
              <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <span className="text-sm font-medium">Manage Users</span>
            </a>
            <a
              href="/dashboard/admin/analytics"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-center group"
            >
              <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <span className="text-sm font-medium">View Analytics</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
