"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Award,
  BookOpen,
  MessageSquare,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart3,
  FileText,
  Check,
  AlertCircle,
  Info,
  LinkIcon,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Notification {
  _id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  sent_at: string;
}

const adminNav = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const teacherNav = [
  { href: "/dashboard/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/teacher/grades", label: "Grades", icon: Award },
  { href: "/dashboard/teacher/quizzes", label: "Online Tests", icon: BookOpen },
  { href: "/dashboard/teacher/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/teacher/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/teacher/progress-reports", label: "Reports", icon: FileText },
];

const studentNav = [
  { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/student/grades", label: "Grades", icon: Award },
  { href: "/dashboard/student/tests", label: "Online Tests", icon: BookOpen },
  { href: "/dashboard/student/calendar", label: "Calendar", icon: Calendar },
];

const parentNav = [
  { href: "/dashboard/parent", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/parent/children", label: "My Children", icon: LinkIcon },
  { href: "/dashboard/parent/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/parent/grades", label: "Grades", icon: Award },
  { href: "/dashboard/parent/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/parent/calendar", label: "Calendar", icon: Calendar },
];

const navByRole: Record<string, typeof adminNav> = {
  admin: adminNav,
  teacher: teacherNav,
  student: studentNav,
  parent: parentNav,
};

function getNotificationMessage(notif: Notification): string {
  switch (notif.type) {
    case "absence":
      return `Absence recorded on ${notif.payload.date as string}`;
    case "grade_posted":
      return `New grade posted: ${notif.payload.assignment as string} — ${notif.payload.score as number} pts`;
    case "new_message":
      return "New message from teacher";
    case "quiz_assigned":
      return `New quiz assigned: ${notif.payload.title as string}`;
    default:
      return notif.type.replace(/_/g, " ");
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "absence": return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    case "grade_posted": return <Award className="w-3.5 h-3.5 text-blue-400" />;
    case "new_message": return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
    default: return <Info className="w-3.5 h-3.5 text-gray-400" />;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);

    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mark_all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = navByRole[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transform transition-transform duration-200 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo - Landing page gradient */}
        <div className="flex items-center gap-3 px-5 h-16 bg-gradient-to-r from-[var(--primary)] to-blue-600 flex-shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">EPS Portal</span>
            <p className="text-white/60 text-[10px] capitalize">{user.role} Access</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/dashboard/${user.role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--primary)]/40 text-white shadow-sm"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--accent-light)]" : "text-white/40"}`} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-light)]" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent)] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 text-sm text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 lg:px-6 gap-4">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1" />

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif._id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-blue-50/40" : ""}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${!notif.read ? "font-medium" : "text-gray-600"}`}>
                              {getNotificationMessage(notif)}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(notif.sent_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0)}
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
