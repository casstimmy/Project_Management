import { useRouter } from "next/router";
import {
  Home,
  Inbox,
  List,
  UserCheck,
  CalendarDays,
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Folder,
    X,

} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProjectModal from "../Modal/ProjectModal";

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const [expandedSpaces, setExpandedSpaces] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [activeSpace, setActiveSpace] = useState("");

  const toggleSpace = (space) => {
    setExpandedSpaces((prev) => ({
      ...prev,
      [space]: !prev[space],
    }));
  };

  const openModal = (spaceName) => {
    setActiveSpace(spaceName);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveSpace("");
  };

  const navLink = (href, label, Icon) => (
    <Link
      href={href}
      className={`flex items-center gap-3 p-2 rounded-lg text-sm transition group ${
        router.pathname === href
          ? "bg-indigo-100 text-indigo-700 font-medium"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Icon size={18} className="text-gray-500 group-hover:text-indigo-500" />
      {label}
    </Link>
  );

  const spaces = [
    {
      name: "My Space",
      projects: ["Web Site", "Client Portal", "Docs"],
    },
    {
      name: "Design Hub",
      projects: ["Brand Kit", "My Files"],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200 h-full shadow-xl flex flex-col transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-2">
              <button className="hidden md:inline-flex items-center justify-center p-1.5 bg-indigo-600 text-white rounded hover:scale-105 transition">
                <Plus size={18} />
              </button>
              <button
                onClick={onClose}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-sm">
            {/* Primary Links */}
            <div className="space-y-1">
              {navLink("/", "Home", Home)}
              {navLink("/inbox", "Inbox", Inbox)}
              {navLink("/my-tasks", "My Tasks", List)}
              {navLink("/assigned", "Assigned to me", UserCheck)}
              {navLink("/today", "Today & Overdue", CalendarDays)}
            </div>

            {/* Workspaces */}
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Workspaces
              </p>
              <ul className="ml-2 space-y-1">
                <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">
                  All Tasks – Ayoola&apos;s Workspace
                </li>
                <li className="text-gray-500 italic text-sm ml-2">
                  You can add more workspaces here
                </li>
              </ul>

              <button className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition ml-2">
                <Plus size={14} />
                New Workspace
              </button>
            </div>

            {/* Spaces & Projects */}
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Spaces
              </p>

              {spaces.map((space) => (
                <div key={space.name} className="mb-2">
                  <button
                    onClick={() => toggleSpace(space.name)}
                    className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users size={16} />
                      {space.name}
                    </div>
                    {expandedSpaces[space.name] ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* Project List */}
                  {expandedSpaces[space.name] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {space.projects.map((project) => (
                        <Link
                          key={project}
                          href="#"
                          className="flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 text-gray-600"
                        >
                          <List size={14} />
                          {project}
                        </Link>
                      ))}

                      <button
                        onClick={() => openModal(space.name)}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                      >
                        <Plus size={14} />
                        Add Project
                      </button>
                    </div>
                  )}
                </div>
              ))}
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

      {/* Modal */}
      {showModal && (
     <ProjectModal activeSpace={activeSpace} closeModal={closeModal} />
      )}
    </>
  );
}
