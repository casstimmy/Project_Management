import { useState } from "react";
import { X } from "lucide-react";

export default function AddTaskModal({ status = "todo", onClose, onSave }) {
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSave = () => {
    if (!name.trim()) return;

    const newTask = {
      _id: Date.now().toString(),
      name,
      assignee: assignee ? { name: assignee, email: "" } : null,
      dueDate: dueDate || null,
      priority,
      status,
      comments: [],
    };

    onSave(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

        {/* Name */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Task Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Assignee */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Assignee:</label>
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Due Date */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Priority */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Task
        </button>
      </div>
    </div>
  );
}
