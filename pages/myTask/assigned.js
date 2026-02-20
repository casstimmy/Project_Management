import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader } from "@/components/ui/SharedComponents";
import { ListChecks, Clock, FolderKanban, Inbox } from "lucide-react";
import Link from "next/link";

export default function AssignedToMe() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
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
    };
    fetchTasks();
  }, []);

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

  const statusLabel = {
    todo: "To Do", inprogress: "In Progress", review: "Review",
    blocked: "Blocked", done: "Done",
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Tasks Assigned to Me"
          subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""} assigned`}
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "My Tasks" }]}
        />

        {loading ? (
          <Loader text="Loading your tasks..." />
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No tasks assigned</h3>
            <p className="text-sm text-gray-500">Tasks assigned to you will appear here.</p>
          </div>
        ) : (
          <>
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({tasks.length})
              </button>
              {Object.entries(statusCounts).map(([status, count]) => (
                <button key={status} onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {statusLabel[status] || status} ({count})
                </button>
              ))}
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div key={task._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{task.name}</h3>
                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabel[task.status] || task.status}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColor[task.priority] || "bg-gray-100 text-gray-600"}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.progress > 0 && (
                          <span className="text-[10px] text-blue-500 font-medium">{task.progress}%</span>
                        )}
                      </div>
                    </div>
                    {task.projectId && (
                      <Link href={`/projects/${task.projectId}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0">
                        <FolderKanban size={12} />
                        View Project
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
