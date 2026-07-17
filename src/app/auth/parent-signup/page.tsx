"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, Phone, User, ChevronRight, LinkIcon, Users } from "lucide-react";

export default function ParentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verification_code: verificationCode, relationship }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to link child");
        return;
      }

      router.push("/dashboard/parent");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-light)] to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Parent Sign Up</h1>
          <p className="text-sm text-white/50 mt-1">Create your account to track your child&apos;s progress</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all backdrop-blur-sm"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all backdrop-blur-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all backdrop-blur-sm"
                placeholder="+251 9XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all backdrop-blur-sm"
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl hover:bg-[var(--accent-light)] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--accent-light)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Link child
  return (
    <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <LinkIcon className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Link Your Child</h1>
        <p className="text-sm text-white/50 mt-1">Enter the verification code from your enrollment letter</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleLinkChild} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Student Verification Code</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm font-mono text-center tracking-wider text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all backdrop-blur-sm"
            placeholder="Enter code from enrollment letter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Relationship</label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all backdrop-blur-sm"
          >
            <option value="parent" className="bg-gray-800">Parent</option>
            <option value="guardian" className="bg-gray-800">Guardian</option>
            <option value="father" className="bg-gray-800">Father</option>
            <option value="mother" className="bg-gray-800">Mother</option>
            <option value="grandparent" className="bg-gray-800">Grandparent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl hover:bg-[var(--accent-light)] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Linking..." : "Link Child"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/parent")}
          className="w-full text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
