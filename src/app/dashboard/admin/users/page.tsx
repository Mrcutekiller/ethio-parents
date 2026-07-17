"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Copy,
  Check,
  Share2,
  Mail,
  Eye,
  EyeOff,
  Printer,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  profile?: {
    student_id?: string;
    verification_code?: string;
    assigned_classes?: string[];
    assigned_subjects?: string[];
  };
}

const branches = [
  "Main Campus",
  "Branch 1 - Bole",
  "Branch 2 - Piassa",
  "Branch 3 - Kazanchis",
];

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12",
];

const sections = ["A", "B", "C", "D", "E"];

const subjects = [
  "Mathematics", "English", "Amharic", "Physics", "Chemistry",
  "Biology", "History", "Geography", "Civics", "Economics",
  "ICT", "Physical Education", "Art", "Music",
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "teacher" as "teacher" | "student",
    password: "",
    branch: "",
    grade_level: "",
    section: "",
    subject_ids: [] as string[],
  });
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    role: string;
    tempPassword: string;
    student_id?: string;
    verification_code?: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Combine branch/grade/section into a class_id-like value for the API
    const classId = [newUser.branch, newUser.grade_level, newUser.section].filter(Boolean).join(" - ") || undefined;

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        password: newUser.password || undefined,
        class_id: classId,
        subject_ids: newUser.subject_ids,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setCreatedCredentials({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tempPassword: data.tempPassword || newUser.password,
        student_id: data.student_id,
        verification_code: data.verification_code,
      });
      fetchUsers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: currentStatus === "active" ? "inactive" : "active" }),
    });
    fetchUsers();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSubject = (subject: string) => {
    setNewUser((prev) => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subject)
        ? prev.subject_ids.filter((s) => s !== subject)
        : [...prev.subject_ids, subject],
    }));
  };

  const filtered = users.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreatedCredentials(null); }}
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Account
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
            placeholder="Search by name or email..."
          />
        </div>
        <div className="flex gap-2">
          {["all", "teacher", "student", "parent"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === r
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center text-sm font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === "admin" ? "bg-red-100 text-red-700" :
                        user.role === "teacher" ? "bg-blue-100 text-blue-700" :
                        user.role === "student" ? "bg-green-100 text-green-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 font-mono">
                      {user.profile?.student_id || "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.status)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title={user.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto border border-gray-100">
            {createdCredentials ? (
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                    <Sparkles className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">Account Created!</h2>
                  <p className="text-xs text-gray-500 mt-1">Share these credentials securely.</p>
                </div>

                <div className="border border-dashed border-gray-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bg-[var(--primary)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    {createdCredentials.role}
                  </div>

                  <div className="border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Institution</span>
                    <span className="text-sm font-extrabold text-[var(--foreground)]">Ethio Parents&apos; School</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Full Name</span>
                      <span className="text-sm font-semibold text-gray-700">{createdCredentials.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Portal Role</span>
                      <span className="text-sm font-semibold text-gray-700 capitalize">{createdCredentials.role}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email / Username</span>
                        <span className="text-sm font-mono font-medium text-gray-800">{createdCredentials.email}</span>
                      </div>
                      <button onClick={() => copyToClipboard(createdCredentials.email, "email")} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                        {copied === "email" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Temporary Password</span>
                        <span className="text-sm font-mono font-medium text-gray-800">{createdCredentials.tempPassword}</span>
                      </div>
                      <button onClick={() => copyToClipboard(createdCredentials.tempPassword, "pw")} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                        {copied === "pw" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {createdCredentials.student_id && (
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Student ID</span>
                          <span className="text-sm font-mono font-medium text-gray-800">{createdCredentials.student_id}</span>
                        </div>
                        <button onClick={() => copyToClipboard(createdCredentials.student_id!, "sid")} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                          {copied === "sid" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    {createdCredentials.verification_code && (
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Parent Link Code</span>
                          <span className="text-sm font-mono font-medium text-gray-800">{createdCredentials.verification_code}</span>
                        </div>
                        <button onClick={() => copyToClipboard(createdCredentials.verification_code!, "vc")} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                          {copied === "vc" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-[var(--primary)]/5 p-2.5 rounded-lg border border-[var(--primary)]/10 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Login URL</span>
                    <span className="text-xs text-[var(--primary)] font-medium break-all block">
                      {typeof window !== "undefined" ? window.location.origin : ""}/auth/login
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      let text = `Ethio Parents' School Portal Credentials\n\n`;
                      text += `Name: ${createdCredentials.name}\n`;
                      text += `Role: ${createdCredentials.role.toUpperCase()}\n`;
                      if (createdCredentials.student_id) text += `Student ID: ${createdCredentials.student_id}\n`;
                      text += `Login Email: ${createdCredentials.email}\n`;
                      text += `Password: ${createdCredentials.tempPassword}\n`;
                      if (createdCredentials.verification_code) {
                        text += `Parent Verification Code: ${createdCredentials.verification_code}\n`;
                        text += `(Use this code in the parent portal to link your child's account)\n`;
                      }
                      text += `\nLogin Here: ${typeof window !== "undefined" ? window.location.origin : ""}/auth/login`;
                      copyToClipboard(text, "share");
                    }}
                    className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied === "share" ? "Copied!" : "Copy Share Text"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Print Receipt
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowCreate(false);
                    setCreatedCredentials(null);
                    setNewUser({ name: "", email: "", phone: "", role: "teacher", password: "", branch: "", grade_level: "", section: "", subject_ids: [] });
                  }}
                  className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl font-semibold hover:bg-[var(--primary-dark)] shadow-sm transition-all active:scale-[0.98]"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)]">Create Account</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Add a new teacher or student to the system</p>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
                    <div className="relative">
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "teacher" | "student" })}
                        className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white font-medium"
                      >
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      placeholder="e.g. Hana Mulugeta"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email / Username</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      placeholder="e.g. hana@eps.edu.et"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-[10px] text-gray-400 lowercase italic">Optional</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                        placeholder="Leave blank to auto-generate"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      placeholder="e.g. +251 9..."
                    />
                  </div>

                  {/* ── Teacher-specific fields ── */}
                  {newUser.role === "teacher" && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-3">Assignment Details</p>

                      {/* Branch */}
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Branch</label>
                        <div className="relative">
                          <select
                            value={newUser.branch}
                            onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                            className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white"
                          >
                            <option value="">Select branch...</option>
                            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Grade + Section */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Grade Level</label>
                          <div className="relative">
                            <select
                              value={newUser.grade_level}
                              onChange={(e) => setNewUser({ ...newUser, grade_level: e.target.value })}
                              className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white"
                            >
                              <option value="">Select grade...</option>
                              {gradeLevels.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Section</label>
                          <div className="relative">
                            <select
                              value={newUser.section}
                              onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
                              className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none bg-white"
                            >
                              <option value="">Select section...</option>
                              {sections.map((s) => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subjects</label>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => toggleSubject(subject)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                newUser.subject_ids.includes(subject)
                                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                        {newUser.subject_ids.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1.5">{newUser.subject_ids.length} subject(s) selected</p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-sm active:scale-[0.98] mt-2 text-sm"
                  >
                    Create {newUser.role === "teacher" ? "Teacher" : "Student"} Account
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
