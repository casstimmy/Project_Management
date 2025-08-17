// components/Projects/WorkspaceHeader.js
import {
  List,
  Layout,
  Calendar,
  Plus,
  ClipboardCheck,
  BarChart2,
  FileText,
} from "lucide-react";

export default function WorkspaceHeader({ project, activeView, onChangeView }) {
  const navItems = [
    { id: "board", label: "Board", icon: Layout },
    { id: "list", label: "List", icon: List },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "checklist", label: "Checklist", icon: ClipboardCheck },
    { id: "gantt", label: "Gantt", icon: BarChart2 },
    { id: "budget", label: "Budget", icon: FileText },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="border-b px-4 py-4 flex flex-col md:flex-row md:items-center justify-between md:gap-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">{project?.title || "Workspace"}</h1>
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChangeView(id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  activeView === id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-100"
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile scrollable nav */}
      <div className="flex md:hidden overflow-x-auto gap-2 py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChangeView(id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                activeView === id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-100"
              }
            `}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
