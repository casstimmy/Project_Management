import SpaceModal from "../Modal/SpaceModal";
import { useRouter } from "next/router";
import {
  Inbox,
  List,
  UserCheck,
  CalendarDays,
  Users,
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  AppWindow,
  X,
  CircleCheck,
  CircleUserRound,
  Network,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProjectModal from "../Modal/ProjectModal";

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const [showTasksMenu, setShowTasksMenu] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState({ __main__: true });
  const [showModal, setShowModal] = useState(false);
  const [activeSpace, setActiveSpace] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await fetch("/api/spaces");
        const data = await res.json();
        console.log("Fetched spaces:", data); // debug
        setSpaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch spaces:", err);
        setSpaces([]);
      }
    };

    fetchSpaces();
  }, []);

  const refreshSpaces = async () => {
    try {
      const res = await fetch("/api/spaces");
      const data = await res.json();
      setSpaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to refresh spaces:", err);
      setSpaces([]);
    }
  };

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

  const navLink = (href, label, Icon, extraClass = "") => {
    const isActive =
      router.pathname === href || router.pathname.startsWith(href);

    return (
      <Link
        href={href}
        className={`flex items-center gap-3 p-2 rounded-lg text-sm transition group ${extraClass} ${
          isActive
            ? "bg-indigo-100 text-indigo-700 font-medium"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <Icon
          size={18}
          className={`group-hover:text-indigo-500 ${
            isActive ? "text-indigo-500" : "text-gray-500"
          }`}
        />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`mr-3 fixed top-0 left-0 ${
          isCollapsed ? "w-20" : "w-72"
        } bg-gray-200 backdrop-blur-xl border-r border-l border-gray-300 rounded-lg h-full shadow-xl flex flex-col transition-all duration-300 md:translate-x-0 md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Collapse Button */}
          <div className={`absolute top-4 z-50 ${isCollapsed ? "right-7" : "right-4"}`}>
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="inline-flex items-center justify-center p-1.5 text-gray-700 hover:scale-105 transition"
            >
              <AppWindow size={18} />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col h-full">
            {/* Header */}
            {!isCollapsed && (
              <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-xl font-bold text-gray-800">Home</h2>
                <div className="flex items-center mr-10 gap-2">
                  <button className="hidden md:inline-flex items-center justify-center p-1.5 bg-indigo-600 text-white rounded hover:scale-105 transition">
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={onClose}
                    className="md:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                  <button className="hidden md:inline-flex items-center justify-center p-1.5 text-gray-700 hover:scale-105 transition">
                    <Search size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-sm">
              {/* Primary Links */}
              <div className="space-y-1">
                {navLink("/inbox", "Inbox", Inbox, isCollapsed ? "mt-9" : "")}

                {/* My Tasks Section */}
                <div>
                  <button
                    onClick={() => setShowTasksMenu((prev) => !prev)}
                    className="w-full flex items-center justify-between px-2 py-2 font-medium hover:bg-gray-100 rounded"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <CircleCheck size={16} />
                      {!isCollapsed && <span>My Tasks</span>}
                    </div>
                    {showTasksMenu ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  {showTasksMenu && (
                    <div className="ml-6 mt-1 space-y-1">
                      {navLink("/myTask/assigned", "Assigned to me", UserCheck)}
                      {navLink("/myTask/today&Overdue", "Today & Overdue", CalendarDays)}
                      {navLink("/myTask/personal-list", "Personal List", CircleUserRound)}
                    </div>
                  )}
                </div>
              </div>

              {/* Spaces */}
              <div className="pt-2">
                <div className="flex items-center justify-between w-full px-2 py-2 hover:bg-gray-100 rounded group">
                  <button
                    onClick={() =>
                      setExpandedSpaces((prev) => ({
                        ...prev,
                        __main__: !prev.__main__,
                      }))
                    }
                    className="flex items-center gap-2 flex-1 text-xs font-semibold uppercase text-gray-600"
                  >
                    {!isCollapsed && (
                      <>
                        <ChevronRight
                          size={16}
                          className={`text-gray-400 transition-transform duration-200 ${
                            expandedSpaces.__main__ ? "rotate-90" : ""
                          }`}
                        />
                        <span>Spaces</span>
                      </>
                    )}
                  </button>

                  {!isCollapsed && (
                    <button
                      onClick={() => setShowSpaceModal(true)}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Add New Space"
                    >
                      <Plus size={16} className="text-gray-500" />
                    </button>
                  )}
                </div>

                {expandedSpaces.__main__ && (
                  <div className="ml-2 mt-2 space-y-2">
                    <Link
                      href="/projects"
                      className="flex items-center gap-3 px-4 py-2 mt-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md w-full shadow-sm"
                    >
                      <span className="bg-white p-2 rounded-md shadow">
                        <Network size={16} className="text-gray-700" />
                      </span>
                      {!isCollapsed && (
                        <span className="font-medium">All Tasks – Ayoola&apos;s Workspace</span>
                      )}
                    </Link>

                    {/* Dynamic Spaces */}
                    {Array.isArray(spaces) &&
                      spaces.map((space) => (
                        <div key={space._id} className="mb-2">
                          <button
                            onClick={() => toggleSpace(space.name)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                              <Users size={16} />
                              {!isCollapsed && space.name}
                            </div>
                            {expandedSpaces[space.name] ? (
                              <ChevronDown size={16} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={16} className="text-gray-400" />
                            )}
                          </button>

                          {expandedSpaces[space.name] && (
                            <div className="ml-6 mt-1 space-y-1 bg-gray-100 p-2 rounded-b-lg">
                              {space.projects?.map((project) => (
                                <Link
                                  key={project._id}
                                  href={`/projects/${project._id}`}
                                  className="flex items-center gap-2 p-2 text-sm rounded hover:bg-white text-gray-600"
                                >
                                  <List size={14} />
                                  {!isCollapsed && project.title}
                                </Link>
                              ))}

                              <button
                                onClick={() => openModal(space.name)}
                                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                              >
                                <Plus size={14} />
                                {!isCollapsed && "Add Project"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                    <button
                      onClick={() => setShowSpaceModal(true)}
                      className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition ml-2"
                    >
                      <Plus size={14} />
                      {!isCollapsed && "New Workspace"}
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Footer */}
            {!isCollapsed && (
              <div className="border-t border-gray-400 px-4 py-3">
                <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition">
                  <Users size={18} className="text-gray-500" />
                  <span className="text-gray-700">Manage Team</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Modals */}
      {showModal && (
        <ProjectModal
          activeSpace={activeSpace}
          closeModal={closeModal}
          allSpaces={spaces}
          onProjectCreated={refreshSpaces}
        />
      )}
      {showSpaceModal && (
        <SpaceModal
          closeModal={() => setShowSpaceModal(false)}
          onSpaceCreated={(newSpace) => {
            setSpaces((prev) => [...prev, { ...newSpace, projects: [] }]);
          }}
        />
      )}
    </>
  );
}
