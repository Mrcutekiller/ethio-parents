"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, AlertTriangle, Play, Shield, Timer, CheckCircle } from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  type: string;
  due_date: string;
  time_limit_minutes: number;
  max_score: number;
  questions: { type: string; question: string; options?: string[]; points: number }[];
}

export default function StudentTestsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; max_score: number } | null>(null);
  const [violations, setViolations] = useState<{ type: string; timestamp: Date }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/quizzes?type=quiz", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setQuizzes(data.quizzes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeQuiz) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => [...prev, { type: "tab_switch", timestamp: new Date() }]);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setViolations(prev => [...prev, { type: "fullscreen_exit", timestamp: new Date() }]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const handleCopy = (e: Event) => e.preventDefault();
    const handlePaste = (e: Event) => e.preventDefault();
    const handleContextMenu = (e: Event) => e.preventDefault();

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [activeQuiz]);

  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft]);

  const startQuiz = async (quiz: Quiz) => {
    try { await document.documentElement.requestFullscreen(); } catch {}
    setActiveQuiz(quiz);
    setAnswers({});
    setViolations([]);
    setResult(null);
    setTimeLeft((quiz.time_limit_minutes || 30) * 60);
  };

  const handleSubmit = async (autoSubmitted = false) => {
    if (!activeQuiz || submitting) return;
    setSubmitting(true);

    const token = localStorage.getItem("token");
    const tabSwitches = violations.filter(v => v.type === "tab_switch").length;
    if (tabSwitches >= 3 && !autoSubmitted) autoSubmitted = true;

    const answerArray = Object.entries(answers).map(([qIndex, answer]) => ({
      question_index: Number(qIndex),
      answer,
    }));

    const res = await fetch(`/api/quizzes/${activeQuiz._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        answers: answerArray,
        violations,
        auto_submitted: autoSubmitted,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setResult({ score: data.attempt.score, max_score: data.attempt.max_score });
    }

    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Active quiz view
  if (activeQuiz && !result) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">{activeQuiz.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{activeQuiz.questions.length} questions &middot; {activeQuiz.max_score} points</p>
            </div>
            <div className="flex items-center gap-4">
              {violations.length > 0 && (
                <span className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                  <AlertTriangle className="w-3 h-3" />
                  {violations.length} violation(s)
                </span>
              )}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-lg font-bold ${
                timeLeft < 300 ? "bg-red-50 text-red-600" : "bg-[var(--primary)]/5 text-[var(--foreground)]"
              }`}>
                <Timer className="w-4 h-4" />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium">
                    <span className="text-[var(--primary)] font-bold">Q{qIndex + 1}.</span> {q.question}
                  </p>
                  <span className="text-xs text-gray-400 ml-2 bg-gray-50 px-2 py-0.5 rounded-full">{q.points} pts</span>
                </div>

                {q.type === "multiple_choice" && q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label
                        key={oIndex}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          answers[qIndex] === opt
                            ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={answers[qIndex] === opt}
                          onChange={() => setAnswers({ ...answers, [qIndex]: opt })}
                          className="w-4 h-4 text-[var(--primary)]"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[qIndex] || ""}
                    onChange={(e) => setAnswers({ ...answers, [qIndex]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                    placeholder="Type your answer..."
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result view
  if (result) {
    const pct = Math.round((result.score / result.max_score) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-12 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            pct >= 70 ? "bg-green-100" : pct >= 50 ? "bg-amber-100" : "bg-red-100"
          }`}>
            <CheckCircle className={`w-8 h-8 ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
          <p className="text-gray-500 mb-6">Your results have been recorded.</p>
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <p className="text-sm text-gray-500">Your Score</p>
            <p className="text-4xl font-bold text-[var(--primary)]">
              {result.score}/{result.max_score}
            </p>
            <p className="text-lg font-semibold mt-1">{pct}%</p>
          </div>
          <button
            onClick={() => { setActiveQuiz(null); setResult(null); }}
            className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-sm text-sm"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  // Quiz list
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Online Tests</h1>
        <p className="text-sm text-gray-500 mt-1">Take quizzes and tests assigned to you</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Secure Test Environment</p>
          <p>During tests, tab switching and full-screen exits are logged. After 3 violations, your test will be auto-submitted. Copy, paste, and right-click are disabled.</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No tests available yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 capitalize">{quiz.type}</p>
                </div>
              </div>
              {quiz.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{quiz.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {quiz.time_limit_minutes || 30} min
                </span>
                <span>{quiz.questions.length} questions</span>
                <span>{quiz.max_score} pts</span>
              </div>
              <button
                onClick={() => startQuiz(quiz)}
                className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
