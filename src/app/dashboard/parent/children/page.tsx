"use client";

import { useEffect, useState } from "react";
import { LinkIcon, Plus, Users, ChevronRight, GraduationCap, BookOpen } from "lucide-react";
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
  const [code, setCode] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/parent/link", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setChildren(data.links || []);
    setLoading(false);
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/parent/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ verification_code: code, relationship }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setShowLink(false);
    setCode("");
    fetchChildren();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Children</h1>
          <p className="text-sm text-gray-500 mt-1">Manage linked children and track their progress</p>
        </div>
        <button
          onClick={() => setShowLink(true)}
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Link Child
        </button>
      </div>

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
          <p className="text-gray-400 text-xs mb-4">Use the verification code from your enrollment letter</p>
          <button
            onClick={() => setShowLink(true)}
            className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-sm"
          >
            Link Your First Child
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
              <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{child.student_name || "Student"}</p>
                    <p className="text-white/70 text-xs">ID: {child.student_profile?.student_id || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 capitalize bg-gray-50 px-2 py-0.5 rounded-full">{child.relationship}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    Linked {new Date(child.verified_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/parent/grades"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    Grades
                  </Link>
                  <Link
                    href="/dashboard/parent/attendance"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-1">Link a Child</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter the verification code from your enrollment letter.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  placeholder="Enter code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                >
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="grandparent">Grandparent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowLink(false); setError(""); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--primary)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-sm"
                >
                  Link Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
