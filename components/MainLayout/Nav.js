// components/MainLayout/Nav.js
import { FaBell, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./Sidebar";
import Link from "next/link"



export default function Nav({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-white/90 backdrop-blur-md border-b shadow-md transition-all duration-300">
        {/* Logo */}
        <div className="flex flex-col justify-center">
       <Link href="/homePage" className="flex items-center">
  <Image src="/images/Logo.png" alt="Logo" width={36} height={36} />
  <span className="text-2xl font-bold text-blue-700 tracking-tight">
    Pal
  </span>
</Link>
          <small className="text-xs text-gray-500">Project Management</small>
        </div>

        {/* Search (desktop) */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 shadow-sm transition"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <FaBell className="text-xl text-gray-500 hover:text-blue-600 cursor-pointer transition-all duration-200" />

          <div className="flex items-center gap-2 text-sm cursor-pointer group relative">
            <FaUserCircle className="text-2xl text-blue-600" />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-semibold group-hover:text-blue-600 transition">{user?.name || "User"}</span>
              <span className="text-xs text-gray-400">{user?.role || "Member"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 shadow-md transition-all duration-200"
          >
            Logout
          </button>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
            >
              {mobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-10">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar user={user} isOpen={true} onClose={() => {}} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed left-0 top-10 z-40 h-[calc(100vh)] w-72  md:hidden transition-transform transform">
              <Sidebar user={user} isOpen={true} onClose={() => setMobileOpen(false)} />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto transition-all duration-300">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
