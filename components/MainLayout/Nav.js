// components/MainLayout/Nav.js
import { FaBell, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./SideBar";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/constants";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function Nav({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("appMode");
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
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <FaBell className="text-lg text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
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
