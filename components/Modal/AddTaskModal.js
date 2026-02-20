import { useState, useEffect } from "react";
import { X, User, Calendar, Flag, Loader2 } from "lucide-react";

export default function AddTaskModal({ status = "todo", onClose, onSave }) {
  const [name, setName] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    fetch("/api/manage/team")
      .then((r) => r.json())
      .then((data) => setTeamMembers(Array.isArray(data) ? data : []))
      .catch(() => setTeamMembers([]))
      .finally(() => setLoadingTeam(false));
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;

    const member = teamMembers.find((m) => m._id === assigneeId);

    const newTask = {
      _id: Date.now().toString(),
      name,
      assignee: member ? { name: member.name, email: member.email || "" } : null,
      startDate: startDate || new Date().toISOString(),
      dueDate: dueDate || null,
      priority,
      status,
      comments: [],
    };

    onSave(newTask);
    onClose();
  };

  const priorityColors = {
    low: "text-emerald-600 bg-emerald-50 border-emerald-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition"
              autoFocus
            />
          </div>

          {/* Assignee (dropdown) */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <User size={14} className="text-gray-400" /> Assign to
            </label>
            {loadingTeam ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 size={14} className="animate-spin" /> Loading team…
              </div>
            ) : (
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} — {m.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Calendar size={14} className="text-gray-400" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Calendar size={14} className="text-gray-400" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Flag size={14} className="text-gray-400" /> Priority
            </label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    priority === p
                      ? priorityColors[p]
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
