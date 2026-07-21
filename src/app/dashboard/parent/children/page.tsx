"use client";

import { useEffect, useState } from "react";
import { LinkIcon, Plus, GraduationCap, BookOpen, ChevronRight, Hash, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ChildData {
  _id: string;
  student_id: string;
  relationship: string;
  verified_at: string;
  student_name?: string;
  student_class?: string;
  student_profile?: { student_id: string; class_id: string };
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [showLink, setShowLink] = useState(false);
  const [linkMethod, setLinkMethod] = useState<"id" | "code">("id");
  const [code, setCode] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/parent/link", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setChildren(data.links || []);
    setLoading(false);
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLinking(true);

    try {
      const token = localStorage.getItem("token");
      const body: Record<string, string> = { relationship };
      if (linkMethod === "id") {
        body.student_id = studentId;
      } else {
        body.verification_code = code;
      }

      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(`${data.student_name || "Child"} linked successfully!`);
      setCode("");
      setStudentId("");
      setShowLink(false);
      fetchChildren();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Children</h1>
          <p className="text-sm text-gray-500 mt-1">Manage linked children and track their progress</p>
        </div>
        <button onClick={() => setShowLink(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
          <Plus className="w-4 h-4" />
          Link Child
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Children Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-[var(--primary)]/40" />
          </div>
          <p className="text-gray-500 text-sm mb-1">No children linked yet</p>
          <p className="text-gray-400 text-xs mb-5">Use your child&apos;s Student ID or verification code to connect</p>
          <button onClick={() => setShowLink(true)}
            className="bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
            Link Your First Child
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-glow group">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 p-4 text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                <div className="flex items-center gap-3 relative">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{child.student_name || "Student"}</p>
                    <p className="text-white/60 text-xs font-mono">ID: {child.student_profile?.student_id || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 capitalize bg-gray-50 px-2.5 py-1 rounded-full">{child.relationship}</span>
                  <span className="text-[10px] text-gray-400">
                    Linked {new Date(child.verified_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/parent/grades"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 px-3 py-2.5 rounded-xl transition-colors">
                    <BookOpen className="w-3.5 h-3.5" />
                    Grades
                  </Link>
                  <Link href="/dashboard/parent/attendance"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-2.5 rounded-xl transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                    Attendance
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Modal */}
      {showLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 p-6 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="relative">
                <h2 className="text-lg font-bold">Link a Child</h2>
                <p className="text-white/60 text-xs mt-1">Enter your child&apos;s Student ID or verification code</p>
              </div>
            </div>

            <div className="p-6">
              {/* Method Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                <button onClick={() => setLinkMethod("id")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    linkMethod === "id" ? "bg-white text-[var(--primary)] shadow-sm" : "text-gray-500"
                  }`}>
                  <Hash className="w-3.5 h-3.5" />
                  Student ID
                </button>
                <button onClick={() => setLinkMethod("code")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    linkMethod === "code" ? "bg-white text-[var(--primary)] shadow-sm" : "text-gray-500"
                  }`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                  Verification Code
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
              )}

              <form onSubmit={handleLink} className="space-y-4">
                {linkMethod === "id" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Student ID</label>
                    <p className="text-[11px] text-gray-400 mb-1.5">Found on the student&apos;s enrollment card</p>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                        placeholder="EPS24001" required />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Verification Code</label>
                    <p className="text-[11px] text-gray-400 mb-1.5">Found on the enrollment letter</p>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                      placeholder="ABCD1234" required />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Relationship</label>
                  <select value={relationship} onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all">
                    <option value="parent">Parent</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                    <option value="grandparent">Grandparent</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowLink(false); setError(""); }}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={linking}
                    className="flex-1 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50">
                    {linking ? "Linking..." : "Link Child"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
