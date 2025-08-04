import {
  FaBell,
  FaHome,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";

const navItems = [
  {
    label: "Home",
    href: "/homePage",
    icon: <FaHome />,
  },
];

export default function Nav({ children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const navigate = (href) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb] z-80 text-gray-800 font-[Inter,sans-serif]">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-16 w-full px-4 bg-white border-b shadow-sm z-50 fixed top-0 left-0 right-0">
        {/* Logo + App Name */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Image src="/images/Logo.png" alt="Logo" width={30} height={30} />
            <span className="text-xl font-bold text-blue-700 tracking-tight">
              Pal
            </span>
          </div>
          <small className="text-xs text-gray-500">Project Management</small>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm mx-6 hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-sm border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
          />
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <FaBell className="text-xl text-gray-500 hover:text-blue-600 cursor-pointer" />
          <div className="flex items-center gap-2 text-sm">
            <FaUserCircle className="text-2xl text-blue-600" />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-semibold">{user?.name || "User"}</span>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden ml-4">
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside
          className={`w-16 h-full bg-white border-r shadow-md flex flex-col items-center py-4 space-y-6 z-40 fixed top-14 left-0 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;

            return (
              <div key={item.href} title={item.label}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`text-xl p-3 rounded-md transition flex items-center justify-center
                    ${isActive ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  {item.icon}
                </button>
              </div>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-16 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
