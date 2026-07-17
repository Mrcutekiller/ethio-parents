"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, Download, ChevronDown, RefreshCw, User, Award, ClipboardCheck } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  student_id: string;
}

interface ReportData {
  student_name: string;
  student_id_code: string;
  class_name: string;
  term: string;
  attendance_pct: number;
  attendance_present: number;
  attendance_total: number;
  grades_by_subject: {
    subject_name: string;
    average: number;
    assignments: { name: string; score: number; max: number }[];
  }[];
  teacher_comment: string;
  generated_at: string;
}

export default function TeacherProgressReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [term, setTerm] = useState("Term 1 - 2024");
  const [teacherComment, setTeacherComment] = useState("");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/students", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data) => { setStudents(data.students || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    if (!selectedStudent) {
      setMessage("Please select a student.");
      return;
    }
    setGenerating(true);
    setMessage("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/progress-reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        student_id: selectedStudent,
        term,
        teacher_comment: teacherComment,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setReport(data.report || data.summary_data || data);
    } else {
      setMessage(data.error || "Failed to generate report.");
    }
    setGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Progress Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate one-click term progress reports for your students</p>
      </div>

      {message && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{message}</div>
      )}

      {/* Generator form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">Generate Report</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <div className="relative">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none"
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.student_id})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <div className="relative">
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none"
              >
                <option>Term 1 - 2024</option>
                <option>Term 2 - 2024</option>
                <option>Term 3 - 2024</option>
                <option>Term 1 - 2025</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={generating || !selectedStudent}
              className="w-full inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 shadow-sm"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Teacher&apos;s Comment</label>
          <textarea
            value={teacherComment}
            onChange={(e) => setTeacherComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            rows={3}
            placeholder="Write a personalized comment for this student's report..."
          />
        </div>
      </div>

      {/* Report Preview */}
      {report && (
        <div>
          <div className="flex justify-end mb-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Print / Save as PDF
            </button>
          </div>

          <div ref={reportRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Ethio Parents&apos; School</h2>
              <p className="text-gray-500 text-sm mt-1">Student Progress Report</p>
              <div className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-sm px-4 py-1.5 rounded-full mt-3">
                {report.term || term}
              </div>
            </div>

            {/* Student Info */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Student</p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {report.student_name || students.find(s => s._id === selectedStudent)?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {report.student_id_code || students.find(s => s._id === selectedStudent)?.student_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Attendance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.attendance_pct ?? "—"}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.attendance_present ?? "—"}/{report.attendance_total ?? "—"} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Overall Average</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.grades_by_subject && report.grades_by_subject.length > 0
                      ? Math.round(report.grades_by_subject.reduce((s, g) => s + g.average, 0) / report.grades_by_subject.length)
                      : "—"}%
                  </p>
                </div>
              </div>
            </div>

            {/* Grades by Subject */}
            {report.grades_by_subject && report.grades_by_subject.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-[var(--foreground)] mb-3">Academic Performance</h3>
                <div className="space-y-3">
                  {report.grades_by_subject.map((subject) => (
                    <div key={subject.subject_name} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{subject.subject_name}</span>
                        <span className={`text-sm font-bold ${
                          subject.average >= 80 ? "text-green-600" : subject.average >= 60 ? "text-amber-600" : "text-red-600"
                        }`}>{subject.average}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${subject.average >= 80 ? "bg-green-500" : subject.average >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(subject.average, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Comment */}
            {(report.teacher_comment || teacherComment) && (
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Teacher&apos;s Comment</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{report.teacher_comment || teacherComment}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
              Generated on {new Date(report.generated_at || new Date()).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })} • Ethio Parents&apos; School Portal
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
