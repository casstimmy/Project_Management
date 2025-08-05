import { useRouter } from "next/router";
import { Plus, List, Users, Home, X } from "lucide-react";
import Link from "next/link";

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200 h-full shadow-xl flex flex-col transition-transform duration-300 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Dashboard
            </h2>
            <div className="flex items-center gap-2">
              <button className="hidden md:inline-flex items-center justify-center p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded hover:scale-105 transition">
                <Plus size={18} />
              </button>
              <button
                onClick={onClose}
                className="md:hidden inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className={`flex items-center gap-3 p-3 rounded-lg transition group ${
                router.pathname === "/"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Home
                size={20}
                className={`${
                  router.pathname === "/"
                    ? "text-indigo-600"
                    : "text-gray-500 group-hover:text-indigo-500"
                }`}
              />
              Home
            </Link>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-1">
                Spaces
              </p>
              <Link
                href="/"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition group"
              >
                <Users
                  size={18}
                  className="text-indigo-500 group-hover:scale-110 transition"
                />
                <span className="text-gray-700 font-medium">Team Space</span>
              </Link>

              <div className="ml-6 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-sm transition"
                >
                  <List size={16} className="text-gray-500" />
                  List
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-sm transition"
                >
                  <List size={16} className="text-gray-500" />
                  Hetch
                </Link>
              </div>

              <button className="flex items-center gap-2 mt-3 ml-1 text-sm text-indigo-600 hover:underline">
                <Plus size={14} />
                New Space
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3">
            <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition">
              <Users size={18} className="text-gray-500" />
              <span className="text-gray-700">Manage Team</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
