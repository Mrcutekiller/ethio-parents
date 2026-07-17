"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<{ date: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/attendance", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setRecords(data.records || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-700",
    excused: "bg-blue-100 text-blue-700",
  };

  const presentDays = records.filter(r => r.status === "present").length;
  const totalDays = records.length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Track your attendance history</p>
      </div>

      <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>
          <div>
            <p className="text-white/70 text-sm">Overall Attendance</p>
            <p className="text-lg font-semibold">{presentDays} of {totalDays} days present</p>
          </div>
        </div>

        <div className="w-full bg-white/20 rounded-full h-3 mt-4">
          <div
            className="bg-white h-3 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-[var(--foreground)]">Attendance History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No attendance records yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[record.status] || "bg-gray-100"}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
