// pages/tasks/personal-list.js
import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader } from "@/components/ui/SharedComponents";
import { ListChecks, Inbox } from "lucide-react";

export default function PersonalTaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
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
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const priorityBadge = (p) => {
    const colors = {
      high: "bg-red-50 text-red-700", medium: "bg-amber-50 text-amber-700",
      low: "bg-green-50 text-green-700", urgent: "bg-rose-50 text-rose-700",
    };
    return colors[p] || "bg-gray-50 text-gray-700";
  };

  const statusBadge = (s) => {
    const colors = {
      todo: "bg-gray-100 text-gray-700", inprogress: "bg-blue-50 text-blue-700",
      review: "bg-purple-50 text-purple-700", done: "bg-green-50 text-green-700",
      blocked: "bg-red-50 text-red-700",
    };
    return colors[s] || "bg-gray-100 text-gray-700";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Personal Task List"
          subtitle="Tasks you created for personal tracking"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Personal Tasks" }]}
        />

        {loading ? (
          <Loader text="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Inbox size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No personal tasks</p>
            <p className="text-sm">Your personal tasks will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-blue-50 mt-0.5">
                      <ListChecks size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{task.name}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {task.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                        {task.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(task.status)}`}>
                            {task.status}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-gray-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
