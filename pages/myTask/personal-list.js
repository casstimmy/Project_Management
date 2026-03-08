import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import {
  PageHeader, Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  ListChecks, Inbox, Plus, Clock, CheckCircle2, AlertTriangle,
  ArrowUpRight, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  todo: { label: "To Do", color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  inprogress: { label: "In Progress", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  review: { label: "Review", color: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  blocked: { label: "Blocked", color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  done: { label: "Done", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const priorityColor = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};

export default function PersonalTaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", priority: "medium", dueDate: "", status: "todo",
  });

  const getToken = () => localStorage.getItem("token");

  const fetchTasks = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/tasks/personal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching personal tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Task name is required");
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch("/api/tasks/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Task created");
        setShowAddModal(false);
        setForm({ name: "", description: "", priority: "medium", dueDate: "", status: "todo" });
        fetchTasks();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create task");
      }
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        setShowStatusModal(null);
        fetchTasks();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const completedCount = tasks.filter(t => t.status === "done").length;
  const overdue = tasks.filter(t => t.status !== "done" && t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Personal Task List"
          subtitle="Tasks you created for personal tracking"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Personal Tasks" }]}
          actions={
            <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              New Task
            </Button>
          }
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-600">{tasks.length - completedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-500 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdue}</p>
          </div>
        </div>

        {loading ? (
          <Loader text="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No personal tasks</h3>
            <p className="text-sm text-gray-500 mb-4">Your personal tasks will appear here.</p>
            <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => {
                  const isOverdue = task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date();
                  const sc = statusConfig[task.status] || statusConfig.todo;
                  return (
                    <tr key={task._id} className={`hover:bg-gray-50/50 transition ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {task.status === "done" ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : isOverdue ? (
                              <AlertTriangle size={18} className="text-red-500" />
                            ) : (
                              <ListChecks size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                              {task.name}
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{task.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setShowStatusModal(task)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${priorityColor[task.priority] || "bg-gray-100"}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {task.dueDate ? (
                          <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                            <Clock size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                            {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-1">Overdue</span>}
                          </span>
                        ) : <span className="text-xs text-gray-400">No date</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(task._id)}
                          className="text-gray-400 hover:text-red-500 transition p-1 rounded hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Task Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}
          title="New Personal Task" size="lg"
          footer={<>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create Task"}</Button>
          </>}>
          <div className="space-y-4">
            <FormField label="Task Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Review monthly report" />
            </FormField>
            <FormField label="Description">
              <Textarea rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Task details..." />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Priority">
                <Select value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} />
              </FormField>
              <FormField label="Status">
                <Select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "todo", label: "To Do" }, { value: "inprogress", label: "In Progress" }, { value: "review", label: "Review" }]} />
              </FormField>
              <FormField label="Due Date">
                <Input type="date" value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </FormField>
            </div>
          </div>
        </Modal>

        {/* Quick Status Update Modal */}
        <Modal isOpen={!!showStatusModal} onClose={() => setShowStatusModal(null)} title="Update Task Status" size="sm">
          {showStatusModal && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">Change status for: <strong>{showStatusModal.name}</strong></p>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => handleStatusUpdate(showStatusModal._id, key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3 ${showStatusModal.status === key ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  <span className="text-sm font-medium">{cfg.label}</span>
                  {showStatusModal.status === key && <span className="ml-auto text-xs text-blue-600">Current</span>}
                </button>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
