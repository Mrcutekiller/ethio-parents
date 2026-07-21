"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardCheck, Award, MessageSquare, Calendar, ChevronRight, TrendingUp, AlertCircle, LinkIcon, Sparkles } from "lucide-react";

interface ChildLink {
  _id: string;
  student_id: string;
  relationship: string;
  student_name: string;
  student_class: string;
  student_profile?: { student_id: string; class_id: string };
}

interface AttendanceSummary {
  total: number;
  present: number;
  percentage: number;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [children, setChildren] = useState<ChildLink[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildLink | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/parent/link", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/notifications?unread=true", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([linksData, notifData]) => {
      const links: ChildLink[] = linksData.links || [];
      setChildren(links);
      setUnreadMessages(notifData.unreadCount || 0);
      if (links.length > 0) setSelectedChild(links[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedChild?.student_id) return;
    const token = localStorage.getItem("token");
    fetch(`/api/attendance?student_id=${selectedChild.student_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data) => {
        const records = data.records || [];
        const total = records.length;
        const present = records.filter((r: { status: string }) => r.status === "present" || r.status === "late").length;
        setAttendance({ total, present, percentage: total > 0 ? Math.round((present / total) * 100) : 0 });
      })
      .catch(() => {});
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome, {user?.name || "Parent"}!</h1>
            <p className="text-white/60 text-sm">Monitor your child&apos;s academic progress in real-time</p>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Child</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {children.map((child) => (
              <button key={child._id} onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedChild?._id === child._id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                  selectedChild?._id === child._id ? "bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {child.student_name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{child.student_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{child.relationship}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No children linked yet</p>
            <p className="text-sm text-amber-700 mt-1">Enter your child&apos;s Student ID or verification code to get started.</p>
            <Link href="/dashboard/parent/children" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-800 underline">
              Link a child now
            </Link>
          </div>
        </div>
      )}

      {selectedChild && (
        <>
          {/* Attendance Card */}
          {attendance && (
            <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">{selectedChild.student_name}&apos;s Attendance</p>
                  <p className="text-5xl font-extrabold mt-1">{attendance.percentage}%</p>
                  <p className="text-white/60 text-sm mt-1">{attendance.present} present / {attendance.total} school days</p>
                </div>
                <div className="w-24 h-24 relative flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="2.5"
                      strokeDasharray={`${attendance.percentage} ${100 - attendance.percentage}`} strokeLinecap="round" />
                  </svg>
                  <TrendingUp className="absolute w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/dashboard/parent/attendance", label: "Attendance", icon: ClipboardCheck, gradient: "from-green-500 to-emerald-600", shadow: "shadow-emerald-500/20" },
              { href: "/dashboard/parent/grades", label: "Grades", icon: Award, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20" },
              { href: "/dashboard/parent/messages", label: "Messages", icon: MessageSquare, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", badge: unreadMessages },
              { href: "/dashboard/parent/calendar", label: "Calendar", icon: Calendar, gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/20" },
            ].map((action) => (
              <Link key={action.href} href={action.href}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-glow text-center group relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{action.label}</p>
                {'badge' in action && typeof action.badge === "number" && action.badge > 0 && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {action.badge > 9 ? "9+" : action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 card-glow p-5">
        <h2 className="font-semibold text-sm text-[var(--foreground)] mb-4">Quick Actions</h2>
        <div className="space-y-1">
          <Link href="/dashboard/parent/children" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LinkIcon className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <span className="text-sm font-medium">Manage Children</span>
                <p className="text-xs text-gray-400">Link more children or view details</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard/parent/messages" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-sm font-medium">Message Teachers</span>
                <p className="text-xs text-gray-400">Start or continue a conversation</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
