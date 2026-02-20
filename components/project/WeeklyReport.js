// components/project/Reports.js
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function Reports({ project }) {
  const [view, setView] = useState("overview");

  const tasks = project?.tasks || [];

  // ── Compute stats from real task data ──
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "inprogress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    const review = tasks.filter((t) => t.status === "review").length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    const now = new Date();
    const overdue = tasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < now).length;

    // Status breakdown for pie chart
    const statusData = [
      { name: "Done", value: done, color: "#22C55E" },
      { name: "In Progress", value: inProgress, color: "#3B82F6" },
      { name: "To Do", value: todo, color: "#9CA3AF" },
      { name: "Blocked", value: blocked, color: "#EF4444" },
      { name: "Review", value: review, color: "#8B5CF6" },
    ].filter((d) => d.value > 0);

    // Priority breakdown for bar chart
    const priorityData = ["low", "medium", "high", "urgent"].map((p) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      count: tasks.filter((t) => t.priority === p).length,
    })).filter((d) => d.count > 0);

    // Budget summary
    const budget = project?.budget || [];
    const totalBudget = budget.reduce((s, b) => s + (b.amount || 0), 0);

    // Milestones
    const milestones = tasks.filter((t) => t.type === "milestone");
    const completedMilestones = milestones.filter((t) => t.status === "done");

    // Recent completions (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const recentlyCompleted = tasks.filter(
      (t) => t.status === "done" && t.updatedAt && new Date(t.updatedAt) >= weekAgo
    );

    // upcoming tasks (next 7 days)
    const weekAhead = new Date(now.getTime() + 7 * 86400000);
    const upcoming = tasks.filter(
      (t) => t.status !== "done" && new Date(t.dueDate) >= now && new Date(t.dueDate) <= weekAhead
    );

    return {
      total, done, inProgress, todo, blocked, review, progress, overdue,
      statusData, priorityData, totalBudget, budget,
      milestones, completedMilestones, recentlyCompleted, upcoming,
    };
  }, [tasks, project?.budget]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Project Report</h2>
            <p className="text-sm text-gray-500">{project?.title || "Project"}</p>
          </div>
          <div className="flex gap-2">
            {["overview", "tasks", "budget"].map((tab) => (
              <button key={tab} onClick={() => setView(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  view === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600">{stats.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${stats.progress}%` }} />
          </div>
        </div>
      </div>

      {view === "overview" && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPI label="Total Tasks" value={stats.total} color="text-gray-900" />
            <KPI label="Completed" value={stats.done} color="text-emerald-600" />
            <KPI label="In Progress" value={stats.inProgress} color="text-blue-600" />
            <KPI label="Overdue" value={stats.overdue} color="text-red-600" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Pie */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Task Status Distribution</h3>
              {stats.statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats.statusData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {stats.statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No task data</div>
              )}
            </div>

            {/* Priority Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tasks by Priority</h3>
              {stats.priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stats.priorityData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Milestones & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milestones */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Milestones ({stats.completedMilestones.length}/{stats.milestones.length})
              </h3>
              {stats.milestones.length > 0 ? (
                <div className="space-y-2">
                  {stats.milestones.map((m) => (
                    <div key={m._id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === "done" ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <span className={`text-sm flex-1 ${m.status === "done" ? "text-gray-500 line-through" : "text-gray-800"}`}>
                        {m.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(m.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No milestones defined</p>
              )}
            </div>

            {/* Upcoming work */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming (Next 7 Days)</h3>
              {stats.upcoming.length > 0 ? (
                <div className="space-y-2">
                  {stats.upcoming.map((t) => (
                    <div key={t._id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-400">{t.assignee?.name || "Unassigned"}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No tasks due this week</p>
              )}
            </div>
          </div>
        </>
      )}

      {view === "tasks" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      {t.description && <p className="text-xs text-gray-400 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.assignee?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${t.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{t.progress || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "budget" && (
        <div className="space-y-4">
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₦{stats.totalBudget.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.budget.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Avg per Category</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats.budget.length > 0 ? Math.round(stats.totalBudget / stats.budget.length).toLocaleString() : 0}
              </p>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget Breakdown</h3>
            {stats.budget.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.budget.map((b) => ({ name: b.category, amount: b.amount }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v) => `₦${Number(v).toLocaleString()}`} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {stats.budget.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {stats.budget.map((b, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-gray-700">{b.category}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">₦{b.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No budget data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    todo: "bg-gray-100 text-gray-600",
    inprogress: "bg-blue-50 text-blue-700",
    review: "bg-purple-50 text-purple-700",
    blocked: "bg-red-50 text-red-700",
    done: "bg-emerald-50 text-emerald-700",
  };
  const labels = { todo: "To Do", inprogress: "In Progress", review: "Review", blocked: "Blocked", done: "Done" };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-red-50 text-red-700",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[priority] || "bg-gray-100 text-gray-600"}`}>
      {priority}
    </span>
  );
}
