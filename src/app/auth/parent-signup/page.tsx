"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, Phone, User, ChevronRight, LinkIcon, CheckCircle, GraduationCap, ArrowLeft, Hash } from "lucide-react";

export default function ParentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [linkMethod, setLinkMethod] = useState<"code" | "id">("id");
  const [verificationCode, setVerificationCode] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedStudentName, setLinkedStudentName] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role: "parent" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const body: Record<string, string> = { relationship };
      if (linkMethod === "id") {
        body.student_id = studentId;
      } else {
        body.verification_code = verificationCode;
      }

      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to link child");
        return;
      }

      setLinkedStudentName(data.student_name || "your child");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-dark rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 py-5 border-b border-white/5">
        <div className={`flex items-center gap-2 text-xs font-semibold ${step === 1 ? "text-[var(--accent-light)]" : "text-white/40"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-[var(--accent)] text-white" : "bg-white/10 text-white/40"}`}>
            {step > 1 ? <CheckCircle className="w-3.5 h-3.5" /> : "1"}
          </div>
          Create Account
        </div>
        <div className="w-8 h-px bg-white/10" />
        <div className={`flex items-center gap-2 text-xs font-semibold ${step === 2 ? "text-[var(--accent-light)]" : "text-white/30"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-[var(--accent)] text-white" : "bg-white/10 text-white/30"}`}>2</div>
          Link Child
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-6 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Step 1: Account */}
      {step === 1 && (
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-light)] to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Parent Sign Up</h1>
            <p className="text-sm text-white/40 mt-1">Create your account to track your child&apos;s progress</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/12 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all"
                  placeholder="Your full name" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/12 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all"
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/12 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all"
                  placeholder="+251 9XX XXX XXX" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/8 border border-white/12 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all"
                  placeholder="Min. 6 characters" minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 text-xs font-medium">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--accent)] to-amber-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2">
              {loading ? "Creating account..." : "Create Account & Continue"}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[var(--accent-light)] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Link Child — Success State */}
      {step === 2 && linkedStudentName && (
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">All Set!</h2>
          <p className="text-sm text-white/50 mb-2">
            <span className="text-[var(--accent-light)] font-semibold">{linkedStudentName}</span> has been linked to your account.
          </p>
          <p className="text-xs text-white/30 mb-8">You can now track their attendance, grades, and communicate with teachers.</p>
          <button onClick={() => router.push("/dashboard/parent")}
            className="w-full bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-sm">
            Go to Dashboard
          </button>
          <button onClick={() => router.push("/dashboard/parent")}
            className="w-full mt-3 text-sm text-white/30 hover:text-white/50 transition-colors py-2">
            Add another child later
          </button>
        </div>
      )}

      {/* Step 2: Link Child — Form */}
      {step === 2 && !linkedStudentName && (
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <LinkIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Link Your Child</h1>
            <p className="text-sm text-white/40 mt-1">Connect to your child&apos;s school account</p>
          </div>

          {/* Method Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/8">
            <button onClick={() => setLinkMethod("id")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                linkMethod === "id" ? "bg-[var(--accent)] text-white shadow-md" : "text-white/40 hover:text-white/60"
              }`}>
              <Hash className="w-3.5 h-3.5" />
              Student ID
            </button>
            <button onClick={() => setLinkMethod("code")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                linkMethod === "code" ? "bg-[var(--accent)] text-white shadow-md" : "text-white/40 hover:text-white/60"
              }`}>
              <GraduationCap className="w-3.5 h-3.5" />
              Verification Code
            </button>
          </div>

          <form onSubmit={handleLinkChild} className="space-y-5">
            {linkMethod === "id" ? (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Student ID</label>
                <p className="text-[11px] text-white/30 mb-2">Found on the student&apos;s enrollment card (e.g. EPS24001)</p>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/12 rounded-xl text-sm font-mono tracking-wider text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all"
                    placeholder="EPS24001" required />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Verification Code</label>
                <p className="text-[11px] text-white/30 mb-2">Found on the enrollment letter</p>
                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/8 border border-white/12 rounded-xl text-sm font-mono text-center tracking-[0.3em] text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all"
                  placeholder="ABCD1234" required />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Your Relationship</label>
              <select value={relationship} onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 bg-white/8 border border-white/12 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all appearance-none">
                <option value="parent" className="bg-gray-800">Parent</option>
                <option value="father" className="bg-gray-800">Father</option>
                <option value="mother" className="bg-gray-800">Mother</option>
                <option value="guardian" className="bg-gray-800">Guardian</option>
                <option value="grandparent" className="bg-gray-800">Grandparent</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--accent)] to-amber-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {loading ? "Linking..." : "Link Child to My Account"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <button onClick={() => router.push("/dashboard/parent")}
              className="text-xs text-white/30 hover:text-white/50 transition-colors">
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
