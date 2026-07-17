"use client";

import { useEffect, useState } from "react";
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ParentGradesPage() {
  const [grades, setGrades] = useState<{
    assignment_name: string;
    score: number;
    max_score: number;
    term: string;
    posted_at: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/grades", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setGrades(data.grades || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const average = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length)
    : 0;

  const byTerm = grades.reduce<Record<string, typeof grades>>((acc, g) => {
    if (!acc[g.term]) acc[g.term] = [];
    acc[g.term].push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Child&apos;s Grades</h1>
        <p className="text-sm text-gray-500 mt-1">View academic performance</p>
      </div>

      <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-sm">Overall Average</p>
            <p className="text-3xl font-bold">{average}%</p>
          </div>
          <div className="ml-auto">
            {average >= 70 ? (
              <TrendingUp className="w-5 h-5 text-green-300" />
            ) : average >= 50 ? (
              <Minus className="w-5 h-5 text-amber-300" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-300" />
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 text-sm">
          No grades posted yet
        </div>
      ) : (
        Object.entries(byTerm).map(([term, termGrades]) => (
          <div key={term} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-sm">{term}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Assignment</th>
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {termGrades.map((grade, i) => {
                    const pct = Math.round((grade.score / grade.max_score) * 100);
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium">{grade.assignment_name}</td>
                        <td className="px-5 py-3 text-sm">{grade.score}/{grade.max_score}</td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-semibold ${
                            pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">
                          {new Date(grade.posted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
