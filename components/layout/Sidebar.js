import { useRouter } from "next/router";
import { Plus, List, Users, Home, X } from "lucide-react";
import Link from "next/link";

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 border-r h-full flex flex-col shadow-lg transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        {/* Sidebar content */}
        <div className="flex flex-col h-full px-5 py-6">
          {/* Top section */}
          <div className="flex items-center justify-between mb-8">
            <div className="md:hidden">
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Dashboard button */}
          <nav className="flex flex-col gap-2 text-sm text-gray-700">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2rounded-lg font-medium transition ${
                router.pathname === "/"
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              <Home size={18} /> Dashboard
            </Link>

            {/* Section: Spaces */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                Spaces
              </p>

              {/* Main space */}
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800 font-medium transition"
              >
                <Users size={18} className="text-blue-500" />
                Team Space
              </Link>

              {/* Sub space items */}
              <div className="ml-6 mt-1 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition"
                >
                  <List size={16} /> List
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition"
                >
                  <List size={16} /> Hetch
                </Link>
              </div>

              {/* New Space button */}
              <button className="mt-3 ml-2 flex items-center gap-1.5 text-sm text-blue-600 hover:underline transition">
                <Plus size={14} /> New Space
              </button>
            </div>
          </nav>

          {/* Bottom Add button (for desktop) */}
          <div className="mt-auto pt-6 hidden md:flex">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition">
              <Plus size={16} /> Create New
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
