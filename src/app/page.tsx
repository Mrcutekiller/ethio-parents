"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  Award,
  ChevronRight,
  Menu,
  X,
  Bell,
  BarChart3,
  Lock,
  Smartphone,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  Heart,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";

/* ═══════════════════════ Animated Counter ═══════════════════════ */

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════ Scroll Reveal ═══════════════════════ */

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: "translate-y-5",
    down: "-translate-y-5",
    left: "translate-x-5",
    right: "-translate-x-5",
    scale: "scale-95",
    fade: "",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-[600ms] ease-out ${
        visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : `opacity-0 ${transforms[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════ Data ═══════════════════════ */

const features = [
  { icon: ClipboardCheck, title: "Real-Time Attendance", description: "Teachers mark attendance and parents receive instant notifications the moment their child is marked absent.", bg: "bg-green-50", iconColor: "text-green-600" },
  { icon: Award, title: "Grades & Progress", description: "Track academic progress with trend indicators, subject breakdowns, and auto-generated term reports.", bg: "bg-blue-50", iconColor: "text-blue-600" },
  { icon: MessageSquare, title: "Parent-Teacher Chat", description: "Secure, threaded messaging between parents and teachers, organized per student for clarity.", bg: "bg-amber-50", iconColor: "text-amber-600" },
  { icon: Lock, title: "Secure Online Tests", description: "Anti-cheating quiz module with full-screen lock, tab-switch detection, and server-side validation.", bg: "bg-purple-50", iconColor: "text-purple-600" },
];

const whyChooseUs = [
  { icon: Globe, title: "100% Online Platform", description: "Access everything from anywhere — no paper, no visits. Manage your child's education entirely online." },
  { icon: Zap, title: "Instant Notifications", description: "Absence alerts, grade updates, and messages delivered in real-time to your phone or browser." },
  { icon: Shield, title: "Secure & Private", description: "End-to-end security with role-based access. Your child's data is encrypted and never shared." },
  { icon: Clock, title: "24/7 Access", description: "Check grades, attendance, and messages anytime — evenings, weekends, holidays. The portal never closes." },
  { icon: TrendingUp, title: "Academic Insights", description: "Visual grade trends, attendance patterns, and performance analytics to track your child's growth." },
  { icon: Heart, title: "Built for Ethiopian Schools", description: "Designed for the Ethiopian education system, with Amharic support and local school structures." },
];

const stats = [
  { value: 2400, suffix: "+", label: "Students Enrolled" },
  { value: 120, suffix: "+", label: "Teachers" },
  { value: 98, suffix: "%", label: "Parent Satisfaction" },
  { value: 15, suffix: "+", label: "Years of Excellence" },
];

const testimonials = [
  { name: "Meron Haile", role: "Parent", text: "I get instant notifications whenever my daughter is absent. I no longer have to call the school to check on her attendance.", rating: 5 },
  { name: "Mr. Abebe Kebede", role: "Teacher", text: "The gradebook saves me hours every week. Parents are notified automatically when I post grades.", rating: 5 },
  { name: "Yonas Tadesse", role: "Student", text: "I love being able to see all my grades and upcoming tests in one place. The online quiz system is fair and secure.", rating: 5 },
];

/* ═══════════════════════ Main Page ═══════════════════════ */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({ x: (clientX / innerWidth - 0.5) * 20, y: (clientY / innerHeight - 0.5) * 20 });
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ════════════════ NAVIGATION ════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100/50" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-[var(--foreground)] text-sm leading-none block">EPS Portal</span>
                <span className="text-[10px] text-gray-400 leading-none">Ethio Parents&apos; School</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {["About", "Features", "Why Us", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] px-3 py-2 rounded-lg hover:bg-[var(--primary)]/5 transition-all duration-200">
                  {item}
                </a>
              ))}
              <div className="w-px h-5 bg-gray-200 mx-2" />
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] px-3 py-2 rounded-lg transition-colors">
                Login
              </Link>
              <Link href="/auth/parent-signup"
                className="text-sm font-semibold bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ml-2">
                Parent Sign Up
              </Link>
            </div>

            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-1 shadow-xl">
            {["About", "Features", "Why Us", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="block text-sm font-medium text-gray-600 hover:text-[var(--primary)] px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <Link href="/auth/login" className="block text-sm font-medium text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link href="/auth/parent-signup" className="block text-sm font-semibold bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-4 py-2.5 rounded-xl text-center mt-2" onClick={() => setMobileMenuOpen(false)}>
              Parent Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-20 lg:pt-0 min-h-screen flex items-center overflow-hidden" onMouseMove={handleMouseMove}>
        {/* Background layers */}
        <div className="absolute inset-0 gradient-animate" />
        <div className="hero-mesh" />

        {/* Calm Ethiopian-inspired floating blobs */}
        <div className="hero-blob hero-blob-green" style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }} />
        <div className="hero-blob hero-blob-amber" style={{ transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)` }} />
        <div className="hero-blob hero-blob-amber-deep" style={{ transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)` }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass text-white/90 text-sm font-medium px-5 py-2.5 rounded-full mb-8 animate-fade-in animate-glow"
            style={{ animationDelay: "0.2s" }}>
            <Sparkles className="w-4 h-4 text-[var(--accent-light)]" />
            Ethiopia&apos;s Premier School Connectivity Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-[0.95] tracking-tight animate-slide-up"
            style={{ animationDelay: "0.3s" }}>
            Ethio Parents&apos;
            <br />
            <span className="bg-gradient-to-r from-[var(--accent-light)] via-amber-300 to-[var(--accent)] bg-clip-text text-transparent">
              School Portal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.5s" }}>
            A modern, <strong className="text-white font-semibold">100% online platform</strong> that connects Teachers, Students, and Parents — attendance, grades, tests, and communication in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.7s" }}>
            <Link href="/auth/login"
              className="group inline-flex items-center justify-center gap-2 bg-white text-[var(--primary)] font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 text-sm">
              Login to Portal
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/parent-signup"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent)] to-amber-500 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 text-sm pulse-ring">
              <Users className="w-4 h-4" />
              Create Parent Account — Free
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-12 animate-slide-up" style={{ animationDelay: "0.9s" }}>
            {[
              { icon: Lock, text: "Secure & Encrypted" },
              { icon: Smartphone, text: "Works on Any Device" },
              { icon: Clock, text: "24/7 Access" },
              { icon: Shield, text: "Privacy Guaranteed" },
            ].map((badge) => (
              <div key={badge.text} className="glass text-white/70 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/15 transition-colors duration-300 cursor-default">
                <badge.icon className="w-3.5 h-3.5" />
                {badge.text}
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100L48 94C96 88 192 76 288 68C384 60 480 56 576 58C672 60 768 68 864 72C960 76 1056 76 1152 70C1248 64 1344 52 1392 46L1440 40V100H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100} direction="up">
                <div className="text-center group">
                  <p className="text-4xl md:text-5xl font-extrabold stat-number mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] mx-auto mt-3 rounded-full group-hover:w-20 transition-all duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ ABOUT ════════════════ */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal direction="left">
              <span className="inline-block text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">About Us</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-6 leading-tight">
                Ethio Parents&apos; School
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Founded over 15 years ago, Ethio Parents&apos; School has been a pillar of academic excellence in Addis Ababa. We believe every child deserves a world-class education — and every parent deserves to be part of that journey.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Our digital portal is the bridge between school and home. We&apos;ve moved beyond paper-based systems to give parents real-time visibility into their child&apos;s academic life — from daily attendance to term reports.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CheckCircle, text: "Nationally Accredited" },
                  { icon: CheckCircle, text: "Bilingual Curriculum" },
                  { icon: CheckCircle, text: "Modern Facilities" },
                  { icon: CheckCircle, text: "Digital-First Approach" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <item.icon className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="relative">
                <div className="bg-gradient-to-br from-[var(--primary)] via-blue-700 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                  {/* Animated bg decoration */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

                  <div className="relative">
                    <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                    <p className="text-white/80 leading-relaxed text-lg">
                      To empower Ethiopian families with transparent, real-time access to their children&apos;s education — fostering trust, engagement, and academic excellence through technology.
                    </p>
                    <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-extrabold">15+</p>
                        <p className="text-white/60 text-xs mt-1">Years Active</p>
                      </div>
                      <div>
                        <p className="text-3xl font-extrabold">5K+</p>
                        <p className="text-white/60 text-xs mt-1">Alumni</p>
                      </div>
                      <div>
                        <p className="text-3xl font-extrabold">98%</p>
                        <p className="text-white/60 text-xs mt-1">Pass Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating accent card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100 animate-float" style={{ animationDelay: "1s" }}>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">100% Digital</p>
                    <p className="text-xs text-gray-500">No paper needed</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">Features</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">Everything Your School Needs</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                A comprehensive platform built specifically for Ethiopian schools, designed to keep everyone informed and connected.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 120} direction="up">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-glow h-full group">
                  <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Extra features row */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Bell, title: "Instant Push Notifications", desc: "Absence alerts, grade notifications, and message pings delivered in real-time." },
              { icon: BarChart3, title: "Rich Analytics", desc: "Attendance trends, grade averages, and school-wide performance dashboards." },
              { icon: Smartphone, title: "Mobile-Responsive", desc: "Full functionality on any device — phone, tablet, or desktop. No app needed." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 120} direction="up">
                <div className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm card-hover">
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ WHY CHOOSE US ════════════════ */}
      <section id="why-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">The Modern Way to Stay Connected</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                We&apos;ve replaced outdated paper systems with a powerful online platform that puts parents in control.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, i) => (
              <Reveal key={item.title} delay={i * 100} direction="scale">
                <div className="group bg-white rounded-2xl p-7 shadow-sm border border-gray-100 card-glow relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-bl-full group-hover:from-[var(--primary)]/10 transition-colors duration-500" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[var(--primary)]/20 group-hover:shadow-xl group-hover:shadow-[var(--primary)]/30 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">Loved by Our Community</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 150} direction="up">
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 h-full flex flex-col card-glow group">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)] group-hover:scale-110 transition-transform" style={{ transitionDelay: `${j * 50}ms` }} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-animate relative overflow-hidden">
        {/* CTA background orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="max-w-4xl mx-auto text-center relative">
          <Reveal>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join Ethio Parents&apos; School Portal today and stay connected with your child&apos;s education journey.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/parent-signup"
                className="group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[var(--accent-light)] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 text-sm pulse-ring">
                Create Parent Account — Free
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 glass text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/15 transition-all duration-300 text-sm">
                Login
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--sidebar)] text-gray-400 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">EPS Portal</span>
                  <span className="text-xs text-gray-500">Ethio Parents&apos; School</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-gray-500">
                Ethiopia&apos;s premier school connectivity platform — keeping families and educators connected, informed, and engaged.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><Link href="/auth/login" className="text-sm hover:text-white transition-colors duration-200">Login</Link></li>
                <li><Link href="/auth/parent-signup" className="text-sm hover:text-white transition-colors duration-200">Parent Sign Up</Link></li>
                <li><a href="#about" className="text-sm hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="#why-us" className="text-sm hover:text-white transition-colors duration-200">Why Choose Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  Addis Ababa, Ethiopia
                </li>
                <li className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  +251 11 XXX XXXX
                </li>
                <li className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  info@ethioparentsschool.edu.et
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} Ethio Parents&apos; School Portal. All rights reserved.</p>
            <p className="text-xs text-gray-600">Secure &bull; Online &bull; Mobile-Responsive</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
