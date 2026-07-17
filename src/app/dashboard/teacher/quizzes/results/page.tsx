"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, AlertTriangle, CheckCircle, Clock, BarChart3, Users } from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  max_score: number;
  time_limit_minutes: number;
  due_date: string;
}

interface StudentAttempt {
  _id: string;
  student_name: string;
  score: number;
  max_score: number;
  percentage: number;
  tab_switches: number;
  fullscreen_exits: number;
  violations: { type: string; timestamp: string }[];
  auto_submitted: boolean;
  started_at: string;
  submitted_at: string;
  duration_seconds: number | null;
}

interface QuizResults {
  quiz: Quiz;
  attempts: StudentAttempt[];
  total_attempts: number;
  avg_score: number;
}

export default function TeacherQuizResultsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/quizzes", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data) => {
        setQuizzes(data.quizzes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadResults = async (quizId: string) => {
    setSelectedQuizId(quizId);
    setLoadingResults(true);
    const token = localStorage.getItem("token");
    fetch(`/api/quizzes/${quizId}/results`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data) => {
        setResults(data);
        setLoadingResults(false);
      })
      .catch(() => setLoadingResults(false));
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600 bg-green-50";
    if (pct >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Quiz Results</h1>
        <p className="text-sm text-gray-500 mt-1">View per-student scores, violations, and timing analytics</p>
      </div>

      {/* Quiz Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Quiz / Test</label>
        <div className="relative max-w-md">
          <select
            value={selectedQuizId}
            onChange={(e) => loadResults(e.target.value)}
            className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none"
          >
            <option value="">Choose a quiz...</option>
            {quizzes.map((q) => (
              <option key={q._id} value={q._id}>{q.title} ({q.max_score} pts)</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {quizzes.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">No quizzes created yet. Go to Quiz Builder to create one.</p>
        )}
      </div>

      {loadingResults && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {results && !loadingResults && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
                <span className="text-xs text-gray-500">Submissions</span>
              </div>
              <p className="text-2xl font-bold">{results.total_attempts}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"><BarChart3 className="w-4 h-4 text-white" /></div>
                <span className="text-xs text-gray-500">Avg Score</span>
              </div>
              <p className="text-2xl font-bold">{results.avg_score}%</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-white" /></div>
                <span className="text-xs text-gray-500">With Violations</span>
              </div>
              <p className="text-2xl font-bold">
                {results.attempts.filter(a => a.tab_switches + a.fullscreen_exits > 0).length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div>
                <span className="text-xs text-gray-500">Auto-submitted</span>
              </div>
              <p className="text-2xl font-bold">
                {results.attempts.filter(a => a.auto_submitted).length}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[var(--foreground)]">{results.quiz.title} — Individual Results</h2>
            </div>
            {results.attempts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No submissions yet for this quiz.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tab Switches</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fullscreen Exits</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.attempts.map((attempt) => (
                      <tr key={attempt._id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${attempt.tab_switches + attempt.fullscreen_exits > 0 ? "bg-red-50/20" : ""}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-sm font-medium text-[var(--primary)]">
                              {attempt.student_name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{attempt.student_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(attempt.percentage)}`}>
                            {attempt.score}/{attempt.max_score} ({attempt.percentage}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${attempt.tab_switches > 0 ? "text-red-600" : "text-gray-400"}`}>
                            {attempt.tab_switches}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${attempt.fullscreen_exits > 0 ? "text-orange-600" : "text-gray-400"}`}>
                            {attempt.fullscreen_exits}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-500 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(attempt.duration_seconds)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attempt.auto_submitted ? (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Auto-submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Submitted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
