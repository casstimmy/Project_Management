import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import {
  PageHeader, Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  ListChecks, Clock, Inbox, UserPlus,
  CheckCircle2, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AssignedToMe() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [assignForm, setAssignForm] = useState({
    name: "", description: "", priority: "medium", dueDate: "",
    assigneeName: "", assigneeEmail: "", projectId: "",
  });

  const getToken = () => localStorage.getItem("token");

  const fetchTasks = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/tasks/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetch("/api/manage/team").then(r => r.json()).then(d => setTeams(Array.isArray(d) ? d : d?.members || [])).catch(() => {});
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, [fetchTasks]);

  const handleAssign = async () => {
    if (!assignForm.name || !assignForm.assigneeEmail) {
      return toast.error("Task name and assignee email are required");
    }
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(assignForm),
      });
      if (res.ok) {
        toast.success("Task assigned successfully");
        setShowAssignModal(false);
        setAssignForm({ name: "", description: "", priority: "medium", dueDate: "", assigneeName: "", assigneeEmail: "", projectId: "" });
        fetchTasks();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to assign task");
      }
    } catch {
      toast.error("Failed to assign task");
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

  const priorityColor = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    urgent: "bg-red-50 text-red-700 border-red-200",
  };

  const statusConfig = {
    todo: { label: "To Do", color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
    inprogress: { label: "In Progress", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    review: { label: "Review", color: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
    blocked: { label: "Blocked", color: "bg-red-50 text-red-700", dot: "bg-red-500" },
    done: { label: "Done", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const statusCounts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const overdue = tasks.filter(t => t.status !== "done" && t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="My Tasks"
          subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""} assigned to you`}
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "My Tasks" }]}
          actions={
            <Button icon={<UserPlus size={16} />} onClick={() => setShowAssignModal(true)}>
              Assign Task
            </Button>
          }
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.inprogress || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{statusCounts.done || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-500 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdue}</p>
          </div>
        </div>

        {loading ? (
          <Loader text="Loading your tasks..." />
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No tasks assigned</h3>
            <p className="text-sm text-gray-500 mb-4">Tasks assigned to you will appear here.</p>
            <Button icon={<UserPlus size={16} />} onClick={() => setShowAssignModal(true)}>
              Assign Your First Task
            </Button>
          </div>
        ) : (
          <>
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              <button onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${filter === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50" }`}>
                All ({tasks.length})
              </button>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                statusCounts[key] > 0 && (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition border whitespace-nowrap flex items-center gap-2 ${filter === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50" }`}>
                    <span className={`w-2 h-2 rounded-full ${filter === key ? "bg-white" : cfg.dot}`} />
                    {cfg.label} ({statusCounts[key]})
                  </button>
                )
              ))}
            </div>

            {/* Task List Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTasks.map((task) => {
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
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${priorityColor[task.priority] || "bg-gray-100 text-gray-600"}`}>
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${task.progress || 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{task.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {task.projectId && (
                            <Link href={`/projects/${task.projectId}`}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                              Project <ArrowUpRight size={12} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Assign Task Modal */}
        <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)}
          title="Assign Task" size="lg"
          footer={<>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleAssign} disabled={saving}>{saving ? "Assigning..." : "Assign Task"}</Button>
          </>}>
          <div className="space-y-4">
            <FormField label="Task Name" required>
              <Input value={assignForm.name} onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
                placeholder="e.g., Review safety inspection report" />
            </FormField>
            <FormField label="Description">
              <Textarea rows={3} value={assignForm.description}
                onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                placeholder="Describe the task details..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Assignee Name">
                <Select value={assignForm.assigneeName}
                  onChange={(e) => {
                    const member = teams.find(m => m.name === e.target.value);
                    setAssignForm({ ...assignForm, assigneeName: e.target.value, assigneeEmail: member?.email || assignForm.assigneeEmail });
                  }}
                  placeholder="Select team member"
                  options={teams.map(m => ({ value: m.name, label: `${m.name} (${m.role || "Member"})` }))} />
              </FormField>
              <FormField label="Assignee Email" required>
                <Input type="email" value={assignForm.assigneeEmail}
                  onChange={(e) => setAssignForm({ ...assignForm, assigneeEmail: e.target.value })}
                  placeholder="email@example.com" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Priority">
                <Select value={assignForm.priority}
                  onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
                  options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} />
              </FormField>
              <FormField label="Due Date">
                <Input type="date" value={assignForm.dueDate}
                  onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Project (optional)">
              <Select value={assignForm.projectId}
                onChange={(e) => setAssignForm({ ...assignForm, projectId: e.target.value })}
                placeholder="-- No project --"
                options={projects.map(p => ({ value: p._id, label: p.title }))} />
            </FormField>
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
