"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, ClipboardCheck } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalParents: number;
    schoolAttendance: number;
    avgGrade: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">School Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">School-wide performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Users</span>
          </div>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">Attendance Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats?.schoolAttendance || 0}%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">Avg Grade</span>
          </div>
          <p className="text-3xl font-bold">{stats?.avgGrade || 0}%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active Students</span>
          </div>
          <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">School-Wide Overview</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Attendance</span>
              <span className="font-medium">{stats?.schoolAttendance || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats?.schoolAttendance || 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Average Grade</span>
              <span className="font-medium">{stats?.avgGrade || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[var(--primary)] to-blue-500 h-2.5 rounded-full transition-all"
                style={{ width: `${stats?.avgGrade || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
