// components/MainLayout/Nav.js
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from "next/router";
import { useState, useEffect, useRef, useCallback } from "react";
import { checkAuth } from "@/lib/checkAuth";
import Sidebar from "./SideBar";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/constants";
import { useTheme } from "next-themes";
import { Sun, Moon, Inbox, BellRing } from "lucide-react";
import fetchWithAuth from "@/lib/fetchWithAuth";

export default function Nav({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const decoded = checkAuth();
    if (decoded) {
      setUser(decoded);
    } else {
      // Token missing or expired — redirect to login
      router.push("/");
      return;
    }

    // Periodic check every 60s for token expiry
    const interval = setInterval(() => {
      const stillValid = checkAuth();
      if (!stillValid) {
        router.push("/");
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [router]);

  const fetchNotifications = useCallback(async ({ unreadOnly = false, limit = 8 } = {}) => {
    if (!user) return;
    setNotifLoading(true);
    try {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (unreadOnly) qs.set("unreadOnly", "true");
      const res = await fetchWithAuth(`/api/notifications?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) return;
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setNotifLoading(false);
    }
  }, [user]);

  const markNotificationRead = async (notificationId) => {
    try {
      await fetchWithAuth("/api/notifications", {
        method: "PUT",
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("markNotificationRead error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetchWithAuth("/api/notifications", {
        method: "PUT",
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markAllRead error:", err);
    }
  };

  const openNotification = async (n) => {
    if (!n.read) await markNotificationRead(n._id);
    setShowNotifications(false);
    router.push(n.link || "/inbox");
  };

  const formatWhen = (isoDate) => {
    if (!isoDate) return "now";
    const ms = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(isoDate).toLocaleDateString();
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const poller = setInterval(() => fetchNotifications(), 30_000);
    return () => clearInterval(poller);
  }, [user, fetchNotifications]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("appMode");
    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/homePage" className="flex items-center gap-1.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              O
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                OPAL <span className="text-blue-600">shire</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Search (desktop) */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <input
            type="text"
            placeholder="Search assets, work orders, reports..."
            className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-gray-400 transition"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-gray-500" />
              )}
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                const next = !showNotifications;
                setShowNotifications(next);
                if (next) fetchNotifications();
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <FaBell className="text-lg text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing size={16} className="text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                  </div>
                  <button
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-300"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifLoading ? (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-gray-400">
                      <Inbox size={20} className="mx-auto mb-2" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        onClick={() => openNotification(n)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${n.read ? "" : "bg-blue-50/30"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${n.read ? "text-gray-700" : "text-gray-900 font-medium"}`}>{n.title}</p>
                          {!n.read && <span className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                        <div className="mt-1 text-[11px] text-gray-400">{formatWhen(n.createdAt)}</div>
                      </button>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <Link href="/inbox" className="text-xs text-blue-600 hover:text-blue-700" onClick={() => setShowNotifications(false)}>
                    View all notifications
                  </Link>
                  <button
                    onClick={() => fetchNotifications()}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2 text-sm cursor-pointer group">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-semibold text-gray-800 text-sm">{user?.name || "User"}</span>
              <span className="text-xs text-gray-400">{ROLE_LABELS[user?.role] || "Member"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            Logout
          </button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-14">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar user={user} isOpen={true} onClose={() => {}} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-72 md:hidden">
              <Sidebar user={user} isOpen={true} onClose={() => setMobileOpen(false)} />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
