import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader, Modal } from "@/components/ui/SharedComponents";
import {
  CalendarDays, AlertTriangle, Clock, CheckCircle2,
  ListChecks, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
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

export default function TodayOverdueTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTask, setStatusTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/tasks/today-overdue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        setStatusTask(null);
        fetchTasks();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < today);
  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    return d >= today && d <= endOfToday;
  });

  const daysOverdue = (dueDate) => {
    const diff = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
    return diff === 1 ? "1 day overdue" : `${diff} days overdue`;
  };

  const TaskRow = ({ task, isOverdue }) => {
    const sc = statusConfig[task.status] || statusConfig.todo;
    return (
      <tr className={`hover:bg-gray-50/50 transition ${isOverdue ? "bg-red-50/20" : ""}`}>
        <td className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {isOverdue ? (
                <AlertTriangle size={18} className="text-red-500" />
              ) : (
                <ListChecks size={18} className="text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{task.name}</p>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{task.description}</p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <button onClick={() => setStatusTask(task)}
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
          <div className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
            <Clock size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
          {isOverdue && (
            <span className="text-[10px] text-red-500 mt-0.5 block">{daysOverdue(task.dueDate)}</span>
          )}
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
  };

  const TaskTable = ({ tasks: taskList, isOverdue }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {taskList.map((task) => (
            <TaskRow key={task._id} task={task} isOverdue={isOverdue} />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Today & Overdue"
          subtitle="Tasks that need your attention right now"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Today & Overdue" }]}
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Urgent</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-500 mb-1">Due Today</p>
            <p className="text-2xl font-bold text-blue-600">{todayTasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-500 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
          </div>
        </div>

        {loading ? (
          <Loader text="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-500">No tasks due today or overdue.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {overdueTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
                    Overdue ({overdueTasks.length})
                  </h2>
                </div>
                <TaskTable tasks={overdueTasks} isOverdue />
              </div>
            )}

            {todayTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={16} className="text-blue-500" />
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    Due Today ({todayTasks.length})
                  </h2>
                </div>
                <TaskTable tasks={todayTasks} isOverdue={false} />
              </div>
            )}
          </div>
        )}

        {/* Quick Status Update Modal */}
        <Modal isOpen={!!statusTask} onClose={() => setStatusTask(null)} title="Update Task Status" size="sm">
          {statusTask && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">Change status for: <strong>{statusTask.name}</strong></p>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => handleStatusUpdate(statusTask._id, key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3 ${statusTask.status === key ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  <span className="text-sm font-medium">{cfg.label}</span>
                  {statusTask.status === key && <span className="ml-auto text-xs text-blue-600">Current</span>}
                </button>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}