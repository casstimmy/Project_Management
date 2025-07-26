import Layout from "@/components/Layout";
import { useState } from "react";
import { Pencil, Trash2, Plus, CalendarDays, User, Flag, Loader2 } from "lucide-react";

// Sample Data
const initialTasks = [
  {
    id: 1,
    title: "Design homepage hero section",
    assignee: "Sarah",
    dueDate: "2025-08-05",
    priority: "High",
    status: "To Do",
  },
  {
    id: 2,
    title: "Set up backend API",
    assignee: "James",
    dueDate: "2025-08-10",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Write end‑to‑end tests",
    assignee: "Linda",
    dueDate: "2025-08-15",
    priority: "Low",
    status: "Done",
  },
];

const statusCols = [
  { key: "To Do", color: "bg-blue-100 text-blue-800" },
  { key: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { key: "Done", color: "bg-green-100 text-green-800" },
];

const priorityColors = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
  });
  const [action, setAction] = useState(null);

  const onAdd = () => {
    const newTask = { ...form, id: Date.now(), status: "To Do" };
    setTasks([...tasks, newTask]);
    setShowAdd(false);
    setForm({ title: "", assignee: "", dueDate: "", priority: "Medium" });
  };
  const onDelete = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const handleEdit = () => {
    setAction("edit");
    // Simulate edit process or call edit function here
    setTimeout(() => {
      setAction(null);
      console.log(`Editing task ${task.id}`);
    }, 1000); // replace with actual edit logic
  };

  const handleDelete = () => {
    setAction("delete");
    onDelete(task.id);
    setTimeout(() => setAction(null), 1000); // optional, if onDelete is async
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-100 to-white min-h-screen p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Project Tasks</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Filter tasks..."
              className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <Plus size={18} /> Add Task
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusCols.map(({ key: status, color }) => (
            <div
              key={status}
              className="bg-white rounded-2xl shadow-md border p-4"
            >
              <h2
                className={`text-lg font-bold mb-4 px-3 py-1 rounded-full inline-block ${color}`}
              >
                {status}
              </h2>
              <div className="space-y-4">
                {tasks
                  .filter((t) => t.status === status)
                  .filter(
                    (t) =>
                      t.title.toLowerCase().includes(filter.toLowerCase()) ||
                      t.assignee.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-50 hover:bg-gray-100 transition rounded-xl p-4 shadow-sm border flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">
                          {task.title}
                        </h3>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            priorityColors[task.priority]
                          }`}
                        >
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 flex flex-col gap-1">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" /> {task.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" /> Due:{" "}
                          {task.dueDate}
                        </span>
                      </div>
                    <div className="flex justify-end gap-3 text-sm mt-2 pt-2 border-t">
  <button
    onClick={() => {
      setAction(`edit-${task.id}`);
      setTimeout(() => {
        console.log(`Editing task ${task.id}`);
        setAction(null);
      }, 1000);
    }}
    disabled={action === `edit-${task.id}`}
    className={`px-4 py-1 rounded-md font-medium transition text-white flex items-center gap-2 ${
      action === `edit-${task.id}`
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
  >
    {action === `edit-${task.id}` ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Editing...
      </>
    ) : (
      "Edit"
    )}
  </button>

  <button
    onClick={() => {
      setAction(`delete-${task.id}`);
      onDelete(task.id);
      setTimeout(() => setAction(null), 1000);
    }}
    disabled={action === `delete-${task.id}`}
    className={`px-4 py-1 rounded-md font-medium transition text-white flex items-center gap-2 ${
      action === `delete-${task.id}`
        ? "bg-red-400 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700"
    }`}
  >
    {action === `delete-${task.id}` ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Deleting...
      </>
    ) : (
      "Delete"
    )}
  </button>
</div>

                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">📝 New Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Assignee</label>
                  <input
                    type="text"
                    value={form.assignee}
                    onChange={(e) =>
                      setForm({ ...form, assignee: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Person responsible"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="High">🔥 High</option>
                    <option value="Medium">⚖️ Medium</option>
                    <option value="Low">🌱 Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={onAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
