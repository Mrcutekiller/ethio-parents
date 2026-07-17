"use client";

import { useState } from "react";
import { Plus, Trash2, Save, BookOpen, ChevronDown, Clock } from "lucide-react";

interface Question {
  type: "multiple_choice" | "short_answer";
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
}

export default function TeacherQuizzesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [type, setType] = useState<"quiz" | "test" | "assignment">("quiz");
  const [timeLimit, setTimeLimit] = useState(30);
  const [dueDate, setDueDate] = useState("");
  const [randomized, setRandomized] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { type: "multiple_choice", question: "", options: ["", "", "", ""], correct_answer: "", points: 10 },
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const addQuestion = () => {
    setQuestions([...questions, { type: "multiple_choice", question: "", options: ["", "", "", ""], correct_answer: "", points: 10 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    const updated = [...questions];
    const q = { ...updated[index] };
    (q as unknown as Record<string, unknown>)[field] = value;
    updated[index] = q;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title || !subjectId || !dueDate) {
      setMessage("Please fill in title, subject, and due date");
      return;
    }

    setSaving(true);
    setMessage("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject_id: subjectId,
        type,
        title,
        description,
        due_date: dueDate,
        questions,
        time_limit_minutes: timeLimit,
        randomized,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Quiz created successfully!");
      setTitle("");
      setDescription("");
      setQuestions([{ type: "multiple_choice", question: "", options: ["", "", "", ""], correct_answer: "", points: 10 }]);
    } else {
      setMessage(data.error || "Failed to create quiz");
    }
    setSaving(false);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Quiz Builder</h1>
        <p className="text-sm text-gray-500 mt-1">Create secure online quizzes and tests</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.includes("Failed")
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-green-50 border border-green-200 text-green-700"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              placeholder="Quiz title"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject ID</label>
            <input
              type="text"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              placeholder="Subject ID"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "quiz" | "test" | "assignment")}
                className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white font-medium"
              >
                <option value="quiz">Quiz</option>
                <option value="test">Test</option>
                <option value="assignment">Assignment</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Due Date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Time Limit</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                min={1}
              />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={randomized}
                onChange={(e) => setRandomized(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-gray-700">Randomize question order</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            rows={2}
            placeholder="Quiz instructions..."
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--primary)]">{qIndex + 1}</span>
                </div>
                <span className="font-semibold text-sm text-[var(--foreground)]">Question {qIndex + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={q.points}
                  onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                  className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  min={1}
                  placeholder="Pts"
                />
                <span className="text-xs text-gray-500">pts</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Question Type</label>
                <div className="relative">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Question Text</label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  rows={2}
                  placeholder="Enter question..."
                />
              </div>

              {q.type === "multiple_choice" && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct_answer === opt}
                        onChange={() => updateQuestion(qIndex, "correct_answer", opt)}
                        className="w-4 h-4 text-[var(--primary)]"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Correct Answer</label>
                <input
                  type="text"
                  value={q.correct_answer}
                  onChange={(e) => updateQuestion(qIndex, "correct_answer", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  placeholder="Correct answer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] font-medium hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add question
          </button>
          <span className="text-xs text-gray-400">{questions.length} questions &middot; {totalPoints} total points</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Creating..." : "Create Quiz"}
        </button>
      </div>
    </div>
  );
}
