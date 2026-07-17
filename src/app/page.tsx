"use client";

import Link from "next/link";
import { useState, useEffect, useRef, type ReactNode } from "react";
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

/* ──────────────────────── Scroll animation wrapper ──────────────────────── */

function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dirClass =
    direction === "up"
      ? "translate-y-8"
      : direction === "down"
        ? "-translate-y-8"
        : direction === "left"
          ? "translate-x-8"
          : direction === "right"
            ? "-translate-x-8"
            : "scale-95";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : `opacity-0 ${dirClass}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────── Data ──────────────────────── */

const features = [
  {
    icon: ClipboardCheck,
    title: "Real-Time Attendance",
    description: "Teachers mark attendance and parents receive instant notifications the moment their child is marked absent.",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Award,
    title: "Grades & Progress",
    description: "Track academic progress with trend indicators, subject breakdowns, and auto-generated term reports.",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "Parent-Teacher Chat",
    description: "Secure, threaded messaging between parents and teachers, organized per student for clarity.",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Lock,
    title: "Secure Online Tests",
    description: "Anti-cheating quiz module with full-screen lock, tab-switch detection, and server-side answer validation.",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const whyChooseUs = [
  {
    icon: Globe,
    title: "100% Online Platform",
    description: "Access everything from anywhere — no paper, no visits, no phone calls. Manage your child's education entirely online.",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Absence alerts, grade updates, and messages delivered in real-time to your phone or browser.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end security with role-based access. Your child's data is encrypted and never shared.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Check grades, attendance, and messages anytime — evenings, weekends, holidays. The portal never closes.",
  },
  {
    icon: TrendingUp,
    title: "Academic Insights",
    description: "Visual grade trends, attendance patterns, and performance analytics to track your child's growth.",
  },
  {
    icon: Heart,
    title: "Built for Ethiopian Schools",
    description: "Designed specifically for the Ethiopian education system, with Amharic support and local school structures in mind.",
  },
];

const stats = [
  { value: "2,400+", label: "Students Enrolled" },
  { value: "120+", label: "Teachers" },
  { value: "98%", label: "Parent Satisfaction" },
  { value: "15+", label: "Years of Excellence" },
];

const howItWorks = [
  {
    step: "01",
    title: "School Registers",
    description: "The school creates student accounts and links each student to their parents' contact information.",
    icon: GraduationCap,
  },
  {
    step: "02",
    title: "Parent Signs Up",
    description: "Parents create an account and link to their child using a verification code from the school.",
    icon: Users,
  },
  {
    step: "03",
    title: "Stay Connected",
    description: "Track attendance, grades, receive alerts, and message teachers — all from one dashboard.",
    icon: Bell,
  },
];

const testimonials = [
  {
    name: "Meron Haile",
    role: "Parent",
    text: "I get instant notifications whenever my daughter is absent. I no longer have to call the school to check on her attendance.",
    rating: 5,
  },
  {
    name: "Mr. Abebe Kebede",
    role: "Teacher",
    text: "The gradebook saves me hours every week. Parents are notified automatically when I post grades.",
    rating: 5,
  },
  {
    name: "Yonas Tadesse",
    role: "Student",
    text: "I love being able to see all my grades and upcoming tests in one place. The online quiz system is fair and secure.",
    rating: 5,
  },
];

/* ──────────────────────── Component ──────────────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-[var(--foreground)] text-sm leading-none block">EPS Portal</span>
                <span className="text-[10px] text-gray-400 leading-none">Ethio Parents&apos; School</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">About</a>
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Features</a>
              <a href="#why" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Why Us</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">How It Works</a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Contact</a>
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                Login
              </Link>
              <Link
                href="/auth/parent-signup"
                className="text-sm font-semibold bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl hover:bg-[var(--primary-dark)] transition-all shadow-md hover:shadow-lg"
              >
                Parent Sign Up
              </Link>
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg animate-fade-in">
            <a href="#about" className="block text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#features" className="block text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#why" className="block text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Why Us</a>
            <a href="#how-it-works" className="block text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <Link href="/auth/login" className="block text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link
              href="/auth/parent-signup"
              className="block text-sm font-semibold bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Parent Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-animate" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)"
          }}
        />
        <div className="absolute top-32 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 glass text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[var(--accent-light)]" />
            Ethiopia&apos;s Premier School Connectivity Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight animate-slide-up">
            Ethio Parents&apos;
            <br />
            <span className="text-[var(--accent-light)]">School Portal</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/75 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            A modern, <strong className="text-white">100% online platform</strong> that connects Teachers, Students, and Parents — attendance, grades, tests, and communication in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--primary)] font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-xl text-sm"
            >
              Login to Portal
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/parent-signup"
              className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[var(--accent-light)] transition-all shadow-xl text-sm"
            >
              <Users className="w-4 h-4" />
              Create Parent Account — Free
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <div className="glass text-white/80 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Secure & Encrypted
            </div>
            <div className="glass text-white/80 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2">
              <Smartphone className="w-3 h-3" />
              Works on Any Device
            </div>
            <div className="glass text-white/80 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2">
              <Clock className="w-3 h-3" />
              24/7 Access
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 42C1200 35 1320 20 1380 12L1440 5V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} delay={i * 100} direction="up">
              <div className="text-center">
                <p className="text-4xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ─── About the School ─── */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll direction="left">
              <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4">About Us</span>
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
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" delay={200}>
              <div className="relative">
                <div className="bg-gradient-to-br from-[var(--primary)] to-blue-800 rounded-3xl p-10 text-white shadow-2xl">
                  <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    To empower Ethiopian families with transparent, real-time access to their children&apos;s education — fostering trust, engagement, and academic excellence through technology.
                  </p>
                  <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-extrabold">15+</p>
                      <p className="text-white/60 text-xs">Years Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold">5,000+</p>
                      <p className="text-white/60 text-xs">Alumni</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold">98%</p>
                      <p className="text-white/60 text-xs">Pass Rate</p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--accent)] rounded-2xl opacity-20 blur-sm" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[var(--primary)] rounded-xl opacity-20 blur-sm" />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4">Features</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">Everything Your School Needs</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                A comprehensive platform built specifically for Ethiopian schools, designed to keep everyone informed and connected.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <AnimateOnScroll key={feature.title} delay={i * 100} direction="up">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover h-full">
                  <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Bell, title: "Instant Push Notifications", desc: "Absence alerts, grade notifications, and message pings delivered in real-time." },
              { icon: BarChart3, title: "Rich Analytics", desc: "Attendance trends, grade averages, and school-wide performance dashboards." },
              { icon: Smartphone, title: "Mobile-Responsive", desc: "Full functionality on any device — phone, tablet, or desktop. No app install required." },
            ].map((item, i) => (
              <AnimateOnScroll key={item.title} delay={i * 100} direction="up">
                <div className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section id="why" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">The Modern Way to Stay Connected</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                We&apos;ve replaced outdated paper systems with a powerful online platform that puts parents in control.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, i) => (
              <AnimateOnScroll key={item.title} delay={i * 80} direction="scale">
                <div className="group bg-white rounded-2xl p-7 shadow-sm border border-gray-100 card-hover relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[var(--primary)]/20 group-hover:shadow-xl group-hover:shadow-[var(--primary)]/30 transition-shadow">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4">How It Works</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">Simple 3-Step Process</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Getting started is easy. Here&apos;s how the portal connects schools and families.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <AnimateOnScroll key={item.step} delay={i * 150} direction="up">
                <div className="text-center relative">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-[var(--primary)]/20 relative z-10">
                    <item.icon className="w-9 h-9 text-white" />
                  </div>
                  <div className="text-6xl font-extrabold text-gray-100 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3 relative z-10">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed relative z-10">{item.description}</p>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-[var(--primary)]/30 to-transparent" />
                  )}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">Loved by Our Community</h2>
            </div>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={t.name} delay={i * 100} direction="up">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-1">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-animate">
        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/75 mb-10">
              Join Ethio Parents&apos; School Portal today and stay connected with your child&apos;s education journey.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/parent-signup"
                className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[var(--accent-light)] transition-all shadow-xl text-sm"
              >
                Create Parent Account — Free
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 glass text-white font-bold px-8 py-4 rounded-2xl transition-all text-sm"
              >
                Login
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--sidebar)] text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">EPS Portal</span>
                  <span className="text-xs text-gray-500">Ethio Parents&apos; School</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Ethiopia&apos;s premier school connectivity platform — keeping families and educators connected, informed, and engaged.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="text-sm hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/auth/parent-signup" className="text-sm hover:text-white transition-colors">Parent Sign Up</Link></li>
                <li><a href="#about" className="text-sm hover:text-white transition-colors">About Us</a></li>
                <li><a href="#why" className="text-sm hover:text-white transition-colors">Why Choose Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  Addis Ababa, Ethiopia
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +251 11 XXX XXXX
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  info@ethioparentsschool.edu.et
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Ethio Parents&apos; School Portal. All rights reserved.</p>
            <p className="text-xs text-gray-600">Secure • Online • Mobile-Responsive</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
