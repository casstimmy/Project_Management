import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { ViewMode } from "gantt-task-react";
import { motion } from "framer-motion";
import "gantt-task-react/dist/index.css";

// 🔹 Utility function to safely parse dates
const parseDate = (date) => (date ? new Date(date) : new Date());

export default function GanttChartPage({ project }) {
  const [view, setView] = useState(ViewMode.Week);
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");

  const Gantt = useMemo(
    () =>
      dynamic(() => import("gantt-task-react").then((mod) => mod.Gantt), {
        ssr: false,
      }),
    []
  );

  // 🔹 Fetch tasks from backend
  useEffect(() => {
    if (!project?._id) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?projectId=${project._id}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Invalid tasks response:", data);
          setTasks([]);
          return;
        }

        const transformed = data.map((t) => ({
          start: parseDate(t.startDate || t.createdAt),
          end: parseDate(t.dueDate),
          name: t.name,
          id: t._id,
          type: t.type === "milestone" ? "milestone" : "task",
          progress: t.progress || 0,
          dependencies: t.dependencies || [],
          isDisabled: false,
          assignee: t.assignee,
          priority: t.priority,
          status: t.status,
          styles: {
            progressColor: t.priority === "urgent" ? "#dc2626" : "#6366f1",
            progressSelectedColor:
              t.priority === "urgent" ? "#991b1b" : "#4338ca",
            barColor:
              t.status === "done"
                ? "#16a34a"
                : t.status === "inprogress"
                ? "#f59e0b"
                : "#9ca3af",
          },
        }));

        setTasks(transformed);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [project?._id]);

  // 🔹 Filter + Search
  const filteredTasks = tasks.filter(
    (t) =>
      (filterStatus === "all" || t.status === filterStatus) &&
      (filterPriority === "all" || t.priority === filterPriority) &&
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 rounded-xl space-y-6">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-slate-100 via-slate-50 to-white text-gray-800 
             rounded-2xl p-6 shadow-md border border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-semibold text-gray-900">
          {project?.name || "Project"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {project?.description || "Project timeline & task progress"}
        </p>
        <div className="flex gap-6 mt-4 text-sm text-gray-700">
          <span>📌 {tasks.length} Tasks</span>
          <span>✅ {tasks.filter((t) => t.status === "done").length} Done</span>
          <span>
            🚀{" "}
            {Math.round(
              tasks.reduce((a, b) => a + b.progress, 0) / (tasks.length || 1)
            )}
            % Progress
          </span>
        </div>
      </motion.div>

      {/* Chart Card */}
      <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-indigo-200 rounded-lg text-sm w-48 shadow-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-indigo-200 text-sm rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="inprogress">In Progress</option>
              <option value="review">Review</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-indigo-200 text-sm rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm text-gray-700 font-semibold whitespace-nowrap">
              View Mode:
            </label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="border border-indigo-200 text-sm rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              {Object.values(ViewMode).map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gantt Table */}
        <div className="overflow-x-auto bg-gradient-to-br from-white to-indigo-50">
          <div className="min-w-[700px] sm:min-w-full p-4">
            {filteredTasks.length > 0 ? (
              <motion.div
                className="rounded-xl border border-indigo-100 bg-white shadow-inner p-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Gantt
                  tasks={filteredTasks}
                  viewMode={view}
                  rowHeight={52}
                  barCornerRadius={6}
                  fontFamily="Inter, sans-serif"
                  fontSize="14"
                  columnWidth={80}
                  listCellWidth="300px"
                  columns={[
                    { name: "name", label: "Task", width: 180 },
                    {
                      name: "assignee",
                      label: "👤 Assignee",
                      width: 160,
                      render: (task) =>
                        task.assignee?.avatar ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-7 h-7 rounded-full border"
                            />
                            <span className="text-sm">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          "—"
                        ),
                    },
                    {
                      name: "priority",
                      label: "⚡ Priority",
                      width: 120,
                      render: (task) => (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            task.priority === "urgent"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "high"
                              ? "bg-orange-100 text-orange-700"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                      ),
                    },
                    {
                      name: "status",
                      label: "📌 Status",
                      width: 130,
                      render: (task) => (
                        <span
                          className={`px-2 py-1 text-xs rounded-md ${
                            task.status === "done"
                              ? "bg-green-100 text-green-700"
                              : task.status === "inprogress"
                              ? "bg-yellow-100 text-yellow-700"
                              : task.status === "review"
                              ? "bg-blue-100 text-blue-700"
                              : task.status === "blocked"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      ),
                    },
                  ]}
                />
              </motion.div>
            ) : (
              <motion.div
                className="text-center text-gray-500 py-10 text-lg font-medium flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-6xl mb-4">📭</span>
                <p>No tasks available for this project yet.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
