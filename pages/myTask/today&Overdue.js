import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader } from "@/components/ui/SharedComponents";
import { CalendarDays, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TodayOverdueTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
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
    };
    fetchTasks();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < today);
  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const priorityColor = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-red-50 text-red-700",
    critical: "bg-red-50 text-red-700",
  };

  const statusColor = {
    todo: "bg-gray-100 text-gray-600",
    inprogress: "bg-blue-50 text-blue-700",
    review: "bg-purple-50 text-purple-700",
    blocked: "bg-red-50 text-red-700",
    done: "bg-emerald-50 text-emerald-700",
  };

  const TaskCard = ({ task, isOverdue }) => (
    <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition ${isOverdue ? "border-red-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isOverdue && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
            <h3 className="text-sm font-semibold text-gray-900 truncate">{task.name}</h3>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColor[task.priority] || "bg-gray-100 text-gray-600"}`}>
              {task.priority}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
              {task.status}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock size={10} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        {task.projectId && (
          <Link href={`/projects/${task.projectId}`}
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0">
            View Project
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Today & Overdue"
          subtitle="Tasks that need your attention right now"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Today & Overdue" }]}
        />

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
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
                    Overdue ({overdueTasks.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <TaskCard key={task._id} task={task} isOverdue />
                  ))}
                </div>
              </div>
            )}

            {/* Today Section */}
            {todayTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={16} className="text-blue-500" />
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    Due Today ({todayTasks.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}