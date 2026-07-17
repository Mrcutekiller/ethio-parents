"use client";

import { useEffect, useState } from "react";
import { Save, Trash2, ChevronDown, Award, TrendingUp } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  student_id: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface GradeRow {
  student_id: string;
  score: number;
  max_score: number;
}

interface ExistingGrade {
  _id: string;
  student_id: string;
  subject_id: string;
  assignment_name: string;
  score: number;
  max_score: number;
  term: string;
  posted_at: string;
}

export default function TeacherGradesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [term, setTerm] = useState("Term 1 - 2024");
  const [assignmentName, setAssignmentName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [existingGrades, setExistingGrades] = useState<ExistingGrade[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/students", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/teachers/profile", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/grades", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([studentData, profileData, gradeData]) => {
      const studentList = studentData.students || [];
      setStudents(studentList);
      setSubjects(profileData.subjects || []);
      setExistingGrades(gradeData.grades || []);
      setGrades(studentList.map((s: Student) => ({ student_id: s._id, score: 0, max_score: 100 })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateScore = (studentId: string, score: number) => {
    setGrades(prev => prev.map(g => g.student_id === studentId ? { ...g, score } : g));
  };

  const updateMaxScore = (value: number) => {
    setGrades(prev => prev.map(g => ({ ...g, max_score: value })));
  };

  const handleSave = async () => {
    if (!assignmentName || !subjectId) {
      setMessage("Please fill in assignment name and select a subject.");
      return;
    }
    setSaving(true);
    setMessage("");
    const token = localStorage.getItem("token");
    const gradeData = grades.map(g => ({
      student_id: g.student_id, subject_id: subjectId, term, assignment_name: assignmentName, score: g.score, max_score: g.max_score,
    }));
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ grades: gradeData }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Grades saved! ${data.notifications_sent} notification(s) sent to parents.`);
      setAssignmentName("");
      fetch("/api/grades", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setExistingGrades(d.grades || []));
    } else {
      setMessage(data.error || "Failed to save grades.");
    }
    setSaving(false);
  };

  const getStudentName = (studentId: string) => students.find(s => s._id === studentId)?.name || studentId;

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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Gradebook</h1>
        <p className="text-sm text-gray-500 mt-1">Enter grades for your students — parents and students are notified instantly</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("entry")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "entry" ? "bg-white text-[var(--foreground)] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Enter Grades
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "history" ? "bg-white text-[var(--foreground)] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Grade History
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.startsWith("Grades") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {activeTab === "entry" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
              <div className="relative">
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {subjects.length === 0 && <p className="text-xs text-gray-400 mt-1">No subjects assigned yet</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Assignment / Test Name</label>
              <input
                type="text"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                placeholder="e.g., Mid-term Exam"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Term</label>
              <div className="relative">
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none"
                >
                  <option>Term 1 - 2024</option>
                  <option>Term 2 - 2024</option>
                  <option>Term 3 - 2024</option>
                  <option>Term 1 - 2025</option>
                  <option>Term 2 - 2025</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Max Score (all)</label>
              <input
                type="number"
                value={grades[0]?.max_score ?? 100}
                onChange={(e) => updateMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                min={1}
              />
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No students in your classes yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">%</th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, idx) => {
                    const student = students.find(s => s._id === grade.student_id);
                    if (!student) return null;
                    const pct = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0;
                    return (
                      <tr key={grade.student_id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center text-xs font-bold text-white">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{student.student_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="number"
                            value={grade.score}
                            onChange={(e) => updateScore(grade.student_id, Number(e.target.value))}
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 mx-auto block transition-all"
                            min={0}
                            max={grade.max_score}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-sm font-semibold ${
                            pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600"
                          }`}>{pct}%</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => setGrades(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving || grades.length === 0}
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : `Save & Publish Grades (${grades.length} students)`}
            </button>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-[var(--foreground)]">Posted Grades</h2>
          </div>
          {existingGrades.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No grades posted yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assignment</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Term</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {existingGrades.slice(0, 50).map((grade) => (
                    <tr key={grade._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-2.5 text-sm font-medium">{getStudentName(grade.student_id)}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{grade.assignment_name}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{grade.term}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-sm font-semibold ${
                          (grade.score / grade.max_score) >= 0.8 ? "text-green-600" :
                          (grade.score / grade.max_score) >= 0.6 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {grade.score}/{grade.max_score}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {new Date(grade.posted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
