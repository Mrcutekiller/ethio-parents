"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardCheck, Award, MessageSquare, Calendar, ChevronRight, TrendingUp, AlertCircle, LinkIcon } from "lucide-react";

interface ChildLink {
  _id: string;
  student_id: string;
  relationship: string;
  student_name: string;
  student_class: string;
  student_profile?: {
    student_id: string;
    class_id: string;
  };
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
    const studentId = selectedChild.student_id;
    fetch(`/api/attendance?student_id=${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome, {user?.name || "Parent"}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your child&apos;s academic progress in real-time</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Select Child</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedChild?._id === child._id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No children linked yet</p>
            <p className="text-sm text-amber-700 mt-1">Enter your child&apos;s verification code from the school to get started.</p>
            <Link href="/dashboard/parent/children" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-800 underline">
              Link a child now
            </Link>
          </div>
        </div>
      )}

      {selectedChild && (
        <>
          {attendance && (
            <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{selectedChild.student_name}&apos;s Attendance</p>
                  <p className="text-4xl font-bold mt-1">{attendance.percentage}%</p>
                  <p className="text-white/70 text-sm mt-1">{attendance.present} present / {attendance.total} school days</p>
                </div>
                <div className="w-20 h-20 relative flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray={`${attendance.percentage} ${100 - attendance.percentage}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <TrendingUp className="absolute w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/parent/attendance" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group card-hover">
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Attendance</p>
              <p className="text-xs text-gray-400 mt-1">Full calendar view</p>
            </Link>

            <Link href="/dashboard/parent/grades" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group card-hover">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Grades</p>
              <p className="text-xs text-gray-400 mt-1">View all results</p>
            </Link>

            <Link href="/dashboard/parent/messages" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group card-hover relative">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Messages</p>
              <p className="text-xs text-gray-400 mt-1">Chat with teachers</p>
              {unreadMessages > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>

            <Link href="/dashboard/parent/calendar" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group card-hover">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Calendar</p>
              <p className="text-xs text-gray-400 mt-1">Upcoming events</p>
            </Link>
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
        <div className="space-y-1">
          <Link href="/dashboard/parent/children" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <span className="text-sm font-medium">Manage Children</span>
                <p className="text-xs text-gray-400">Link more children or view details</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link href="/dashboard/parent/messages" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-sm font-medium">Message Teachers</span>
                <p className="text-xs text-gray-400">Start or continue a conversation</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
