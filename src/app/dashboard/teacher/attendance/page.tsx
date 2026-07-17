"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, AlertCircle, Save, ChevronDown } from "lucide-react";

interface Student {
  _id: string;
  user_id: string;
  student_id: string;
  name: string;
  class_id: string;
}

interface ClassInfo {
  _id: string;
  name: string;
  grade_level: number;
}

type Status = "present" | "absent" | "late" | "excused";

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/teachers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const classList = data.classes || [];
        setClasses(classList);
        if (classList.length > 0) setSelectedClass(classList[0]._id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoadingStudents(true);
    setAttendance({});
    const token = localStorage.getItem("token");
    fetch(`/api/students?class_id=${selectedClass}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setStudents(data.students || []); setLoadingStudents(false); })
      .catch(() => setLoadingStudents(false));
  }, [selectedClass]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const token = localStorage.getItem("token");
    const records = Object.entries(attendance).map(([studentId, status]) => ({ student_id: studentId, status }));
    if (records.length === 0) {
      setMessage("No attendance to save. Please mark at least one student.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ class_id: selectedClass, date, records }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Attendance saved! ${data.notifications_sent} parent notification(s) sent.`);
    } else {
      setMessage(data.error || "Failed to save attendance.");
    }
    setSaving(false);
  };

  const markAll = (status: Status) => {
    const all: Record<string, Status> = {};
    students.forEach((s) => { all[s._id] = status; });
    setAttendance(all);
  };

  const statusButtons: { status: Status; icon: React.ReactNode; color: string; activeColor: string; label: string }[] = [
    { status: "present", icon: <Check className="w-4 h-4" />, color: "bg-green-50 text-green-700 border-green-200", activeColor: "bg-green-500 text-white border-green-500", label: "Present" },
    { status: "absent", icon: <X className="w-4 h-4" />, color: "bg-red-50 text-red-700 border-red-200", activeColor: "bg-red-500 text-white border-red-500", label: "Absent" },
    { status: "late", icon: <Clock className="w-4 h-4" />, color: "bg-amber-50 text-amber-700 border-amber-200", activeColor: "bg-amber-500 text-white border-amber-500", label: "Late" },
    { status: "excused", icon: <AlertCircle className="w-4 h-4" />, color: "bg-blue-50 text-blue-700 border-blue-200", activeColor: "bg-blue-500 text-white border-blue-500", label: "Excused" },
  ];

  const markedCount = Object.keys(attendance).length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const presentCount = Object.values(attendance).filter((s) => s === "present").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Take Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Mark daily attendance — parents are notified of absences instantly</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
        />
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.startsWith("Attendance")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {classes.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Class:</label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white font-medium"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
      {classes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No classes assigned to your profile yet. Contact the admin.
        </div>
      )}

      {selectedClass && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {markedCount > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-6 text-sm">
              <span className="text-gray-500">Marked: <span className="font-semibold text-gray-700">{markedCount}/{students.length}</span></span>
              <span className="text-green-600">Present: <span className="font-semibold">{presentCount}</span></span>
              <span className="text-red-600">Absent: <span className="font-semibold">{absentCount}</span></span>
            </div>
          )}

          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 mr-1">Mark all:</span>
            {statusButtons.map((btn) => (
              <button
                key={btn.status}
                onClick={() => markAll(btn.status)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${btn.color} hover:opacity-80`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No students in this class yet.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center text-sm font-bold text-white">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--foreground)]">{student.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{student.student_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center gap-1.5">
                            {statusButtons.map((btn) => (
                              <button
                                key={btn.status}
                                onClick={() => setAttendance({ ...attendance, [student._id]: btn.status })}
                                className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                                  attendance[student._id] === btn.status
                                    ? btn.activeColor + " shadow-sm"
                                    : btn.color + " hover:opacity-80"
                                }`}
                                title={btn.label}
                              >
                                {btn.icon}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || markedCount === 0}
                  className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : `Save Attendance (${markedCount} students)`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
