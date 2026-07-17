"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient background matching landing */}
      <div className="absolute inset-0 gradient-animate" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)"
        }}
      />
      <div className="absolute top-20 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 p-4">
        <Link href="/" className="inline-flex items-center gap-2.5 text-white hover:opacity-90">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm leading-none block">EPS Portal</span>
            <span className="text-[10px] text-white/60 leading-none">Ethio Parents&apos; School</span>
          </div>
        </Link>
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
