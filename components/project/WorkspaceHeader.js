// components/Projects/WorkspaceHeader.js
import { useRouter } from "next/router";
import {
  List,
  Layout,
  ClipboardCheck,
  BarChart2,
  FileText,
  ArrowLeft,
} from "lucide-react";

export default function WorkspaceHeader({ project, activeView, onChangeView }) {
  const router = useRouter();

  const navItems = [
    { id: "board", label: "Board", icon: Layout },
    { id: "list", label: "List & Calendar", icon: List },
    { id: "checklist", label: "Checklist", icon: ClipboardCheck },
    { id: "gantt", label: "Gantt", icon: BarChart2 },
    { id: "budget", label: "Budget", icon: FileText },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      {/* Top row: back button + project title */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition px-2.5 py-1.5 rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">All Projects</span>
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <h1 className="text-lg font-bold text-gray-800 truncate">
          {project?.title || "Workspace"}
        </h1>
      </div>

      {/* Desktop nav tabs */}
      <div className="hidden md:flex items-center gap-1 flex-wrap">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChangeView(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                activeView === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }
            `}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Mobile scrollable nav */}
      <div className="flex md:hidden overflow-x-auto gap-1.5 py-1 -mx-1 px-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChangeView(id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                activeView === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }
            `}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
