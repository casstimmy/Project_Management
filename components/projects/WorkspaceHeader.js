// components/WorkspaceHeader.js
import { List, Layout, Calendar, Plus } from "lucide-react";

export default function WorkspaceHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Ayoola&apos;s Workspace</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600">
            <List size={16} />
            List
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600">
            <Layout size={16} />
            Board
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600">
            <Calendar size={16} />
            Calendar
          </button>
          <div className="h-4 w-px bg-gray-300 mx-2" />
          <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600">
            <Plus size={16} />
            View
          </button>
        </div>
      </div>
    </div>
  );
}
