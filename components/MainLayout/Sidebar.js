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
  CircleCheck,
  CircleUserRound,
  Network,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProjectModal from "../Modal/ProjectModal";

export default function Sidebar({ user }) {
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

  // Expand parent space if its project is active
  useEffect(() => {
    if (!spaces.length) return;
    const activeProject = spaces.find((space) =>
      space.projects?.some(
        (project) => router.asPath === `/projects/${project._id}`
      )
    );
    if (activeProject) {
      setExpandedSpaces((prev) => ({
        ...prev,
        [activeProject.name]: true,
      }));
    }
  }, [router.asPath, spaces]);



  return (
    <>
   <aside
  className={`${
    isCollapsed ? "w-20" : "w-72"
  } bg-white/80 backdrop-blur-xl border-r border-gray-300 h-[calc(100vh-3rem)] shadow-lg flex flex-col transition-all duration-300`}
>
  <div className="flex flex-col h-full relative pt-10">
    {/* Collapse Button */}
    <div
      className={`absolute top-10 z-50 ${
        isCollapsed ? "right-7" : "right-4"
      }`}
    >
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-indigo-600 hover:scale-110 rounded-md transition-all duration-300 shadow-sm"
      >
        <AppWindow size={18} />
      </button>
    </div>

    {/* Header */}
    {!isCollapsed && (
      <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200">
        
            <Link
  href="../homePage"
  className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
>
  <h2 className="text-xl font-bold text-gray-800 tracking-tight">
    Home
  </h2>
</Link>
         
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 hover:scale-105 transition-all duration-300">
            <Plus size={18} />
          </button>
          <button className="flex items-center justify-center p-2 mr-10 bg-gray-100 rounded-lg shadow hover:bg-gray-200 hover:scale-105 transition-all duration-300">
            <Search size={18} />
          </button>
        </div>
      </div>
    )}

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
      {/* Primary Links */}
      <div className="space-y-2">
        {navLink("/inbox", "Inbox", Inbox, isCollapsed ? "mt-9" : "")}

        {/* My Tasks Section */}
        <div>
          <button
            onClick={() => setShowTasksMenu((prev) => !prev)}
            className="w-full flex items-center justify-between px-2 py-2 font-medium hover:bg-gray-100 rounded-lg transition-all duration-300 shadow-sm"
          >
            <div className="flex items-center gap-2 text-gray-700">
              <CircleCheck size={16} className="text-gray-500" />
              {!isCollapsed && <span>My Tasks</span>}
            </div>
            {showTasksMenu ? (
              <ChevronDown size={16} className="text-gray-400 transition-transform duration-300" />
            ) : (
              <ChevronRight size={16} className="text-gray-400 transition-transform duration-300" />
            )}
          </button>

          {showTasksMenu && (
            <div className="ml-6 mt-2 space-y-1">
              {navLink("/myTask/assigned", "Assigned to me", UserCheck)}
              {navLink("/myTask/today&Overdue", "Today & Overdue", CalendarDays)}
              {navLink("/myTask/personal-list", "Personal List", CircleUserRound)}
            </div>
          )}
        </div>
      </div>

      {/* Spaces */}
      <div className="pt-4">
        <div className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 rounded-lg group transition-all duration-300">
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
                  className={`text-gray-400 transition-transform duration-300 ${
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
            {/* All Tasks */}
            <Link
              href="/projects"
              className={`flex items-center gap-3 px-4 py-2 mt-2 text-sm rounded-md shadow-sm transition
                hover:shadow hover:scale-102 transform ${
                  router.asPath === "/projects"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              <span className="bg-white p-2 rounded-md shadow">
                <Network
                  size={16}
                  className={router.asPath === "/projects" ? "text-indigo-500" : "text-gray-700"}
                />
              </span>
              {!isCollapsed && (
                    <span className="font-medium">
                      All Tasks – {user?.name || "User"}&apos;s Workspace
                    </span>
                  )}     </Link>

            {/* Dynamic Spaces */}
            {spaces.map((space) => {
              const isSpaceActive = space.projects?.some(
                (project) => router.asPath === `/projects/${project._id}`
              );

              return (
                <div key={space._id} className="mb-2">
                  <button
                    onClick={() => toggleSpace(space.name)}
                    className={`flex items-center justify-between w-full px-2 py-2 rounded-lg transition-all duration-300 hover:shadow-sm
                      ${
                        isSpaceActive
                          ? "bg-indigo-100 text-indigo-700 font-medium shadow-inner"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className={isSpaceActive ? "text-indigo-500" : "text-gray-500"} />
                      {!isCollapsed && space.name}
                    </div>
                    {expandedSpaces[space.name] ? (
                      <ChevronDown size={16} className="text-gray-400 transition-transform duration-300" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400 transition-transform duration-300" />
                    )}
                  </button>

                  {expandedSpaces[space.name] && (
                    <div className="ml-6 mt-2 space-y-1 bg-gray-50 p-2 rounded-b-lg shadow-inner">
                      {space.projects?.map((project) => {
                        const isActive = router.asPath === `/projects/${project._id}`;
                        return (
                          <Link
                            key={project._id}
                            href={`/projects/${project._id}`}
                            className={`flex items-center gap-2 p-2 text-sm rounded transition-all duration-300
                              ${
                                isActive
                                  ? "bg-indigo-100 text-indigo-700 font-medium shadow-inner"
                                  : "hover:bg-white text-gray-600"
                              }`}
                          >
                            <List size={14} className={isActive ? "text-indigo-500" : "text-gray-500"} />
                            {!isCollapsed && project.title}
                          </Link>
                        );
                      })}

                      <button
                        onClick={() => openModal(space.name)}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mt-2 transition-transform duration-300 hover:scale-105"
                      >
                        <Plus size={14} />
                        {!isCollapsed && "Add Project"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setShowSpaceModal(true)}
              className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-transform duration-300 hover:scale-105 ml-2"
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
      <div className="border-t border-gray-300 px-4 py-3 mt-auto">
        <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition-shadow duration-300 shadow-sm">
          <Users size={18} className="text-gray-500" />
          <span className="text-gray-700">Manage Team</span>
        </button>
      </div>
    )}
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
