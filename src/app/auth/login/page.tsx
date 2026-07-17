"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        teacher: "/dashboard/teacher",
        student: "/dashboard/student",
        parent: "/dashboard/parent",
      };
      router.push(roleRoutes[data.user.role] || "/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <LogIn className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
        <p className="text-sm text-white/50 mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all backdrop-blur-sm"
              placeholder="you@example.com"
              required
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
              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/40 transition-all backdrop-blur-sm"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl hover:bg-[var(--accent-light)] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-white/50">
          Are you a parent?{" "}
          <Link href="/auth/parent-signup" className="text-[var(--accent-light)] font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
        <p className="text-xs text-white/30">
          Admin, Teacher & Student accounts are created by the school administrator.
        </p>
      </div>
    </div>
  );
}
