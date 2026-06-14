import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader, { DashboardSkeleton } from "@/components/Loader";
import { StatCard } from "@/components/ui/SharedComponents";
import {
  Package, Wrench, ClipboardList, AlertOctagon, ShieldCheck,
  BanknoteArrowUp, Building2, TrendingUp, AlertTriangle, BarChart3,
  Activity, Calendar, ArrowRight, FolderKanban, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { jwtDecode } from "jwt-decode";
import { formatCurrency } from "@/lib/currency";
import fetchWithAuth from "@/lib/fetchWithAuth";
import Link from "next/link";

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export default function HomePage() {
  const [timeOfDay, setTimeOfDay] = useState("");
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/projects", { noStore: true });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setDashboardError("");

    // Retry up to 3 times with increasing backoff to handle cold-start latency
    const MAX_RETRIES = 3;
    const BACKOFF = [0, 800, 1500];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, BACKOFF[attempt] || 1500));
      }

      try {
        const res = await fetchWithAuth(`/api/dashboard?fresh=1&t=${Date.now()}`, { noStore: true });

        if (res.ok) {
          const data = await res.json();
          // Verify we got meaningful data — if summary is empty, the DB might not be ready
          if (data && data.summary) {
            setDashboard(data);
            setLoading(false);
            return;
          }
        }

        // 401 means token issue — don't retry, redirect will happen from Nav
        if (res.status === 401) {
          setDashboardError("Session expired. Please log in again.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Dashboard fetch attempt", attempt + 1, err);
      }
    }

    setDashboardError("Unable to load dashboard data. Please retry.");
    setLoading(false);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Morning");
    else if (hour < 18) setTimeOfDay("Afternoon");
    else setTimeOfDay("Evening");

    // Ensure token is available before making API calls
    const token = localStorage.getItem("token");
    if (!token) return; // Nav will redirect to login

    try { setUser(jwtDecode(token)); } catch { return; }

    // Fetch dashboard and projects in parallel
    fetchDashboard();
    fetchProjects();
  }, [fetchDashboard, fetchProjects]);

  const s = dashboard?.summary || {};

  const quickLinks = [
    { label: "Asset Register", href: "/assets", icon: <Package size={18} />, color: "bg-blue-50 text-blue-600" },
    { label: "Work Orders", href: "/workorders", icon: <ClipboardList size={18} />, color: "bg-orange-50 text-orange-600" },
    { label: "Maintenance", href: "/maintenance", icon: <Wrench size={18} />, color: "bg-purple-50 text-purple-600" },
    { label: "HSSE Audit", href: "/hsse", icon: <ShieldCheck size={18} />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Incidents", href: "/incidents", icon: <AlertOctagon size={18} />, color: "bg-red-50 text-red-600" },
    { label: "Budgets", href: "/budgets", icon: <BanknoteArrowUp size={18} />, color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <Layout>
      {loading ? (
        <DashboardSkeleton />
      ) : dashboardError ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-red-200 rounded-md p-6 mb-6">
            <h2 className="text-base font-semibold text-red-700">Dashboard Load Failed</h2>
            <p className="text-sm text-red-600 mt-1">{dashboardError}</p>
            <button
              onClick={fetchDashboard}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-md p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Good {timeOfDay}, {user?.name ? user.name.split(" ")[0] : "Guest"}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                OPAL Facility Management — operations overview
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Package size={20} />} label="Total Assets" value={s.totalAssets || 0} color="blue"
            subtext={`${s.assetsNearReplacement || 0} near replacement`} />
          <StatCard icon={<ClipboardList size={20} />} label="Active Work Orders" value={s.activeWorkOrders || 0} color="orange"
            subtext={`${s.overdueWorkOrders || 0} overdue`} />
          <StatCard icon={<AlertOctagon size={20} />} label="Open Incidents" value={s.openIncidents || 0} color="red" />
          <StatCard icon={<ShieldCheck size={20} />} label="Compliance Score" value={`${(s.complianceScore || 0).toFixed(0)}%`}
            color={(s.complianceScore || 0) >= 80 ? "green" : "yellow"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Building2 size={20} />} label="Sites" value={s.totalSites || 0} color="indigo" />
          <StatCard icon={<BarChart3 size={20} />} label="Avg FCI" value={`${((s.facilityConditionIndex || 0) * 100).toFixed(1)}%`}
            color={(s.facilityConditionIndex || 0) <= 0.1 ? "green" : "red"} />
          <StatCard icon={<Wrench size={20} />} label="Maintenance Due" value={s.maintenanceDue || 0} color="purple" />
          <StatCard icon={<BanknoteArrowUp size={20} />} label="Budget Variance" value={formatCurrency(s.budgetVariance || 0)}
            color={(s.budgetVariance || 0) >= 0 ? "green" : "red"} subtext={(s.budgetVariance || 0) >= 0 ? "Under budget" : "Over budget"} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Work Orders by Status */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Work Orders by Status</h3>
            {dashboard?.charts?.workOrdersByStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboard.charts.workOrdersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No work order data</div>
            )}
          </div>

          {/* Assets by Category */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Assets by Category</h3>
            {dashboard?.charts?.assetsByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={dashboard.charts.assetsByCategory} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, count }) => `${_id}: ${count}`}>
                    {dashboard.charts.assetsByCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No asset data</div>
            )}
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Work Orders by Priority */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Work Orders by Priority</h3>
            {dashboard?.charts?.workOrdersByPriority?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dashboard.charts.workOrdersByPriority} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {dashboard.charts.workOrdersByPriority.map((entry, i) => {
                      const colorMap = { low: "#10B981", medium: "#F59E0B", high: "#F97316", critical: "#EF4444" };
                      return <Cell key={i} fill={colorMap[entry._id] || "#3B82F6"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>

          {/* Incidents by Type */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Incidents by Type</h3>
            {dashboard?.charts?.incidentsByType?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dashboard.charts.incidentsByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No incident data</div>
            )}
          </div>
        </div>

        {/* Project Overview */}
        <div className="bg-white rounded-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FolderKanban size={16} className="text-blue-500" />
              Project Overview
            </h3>
            <Link href="/projects" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map((proj) => {
                const isExpanded = expandedProject === proj._id;
                const taskCount = proj.tasks?.length || 0;
                const doneTasks = proj.tasks?.filter?.((t) => typeof t === "object" && t.status === "done")?.length || 0;
                const budgetTotal = (proj.budget || []).reduce((s, b) => s + (b.amount || 0), 0);

                return (
                  <div key={proj._id} className="border border-gray-100 rounded-md overflow-hidden">
                    <button
                      onClick={() => setExpandedProject(isExpanded ? null : proj._id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{proj.title}</p>
                        <p className="text-xs text-gray-500">{taskCount} tasks • {formatCurrency(budgetTotal)} budget</p>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-gray-50 bg-gray-50/50">
                        <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                          <div>
                            <span className="text-gray-500">Purpose:</span>
                            <p className="text-gray-700 mt-0.5">{proj.purpose || "—"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Scope:</span>
                            <p className="text-gray-700 mt-0.5">{proj.scope || "—"}</p>
                          </div>
                        </div>
                        {proj.budget?.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-2">
                            {proj.budget.map((b, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {b.category}: {formatCurrency(b.amount)}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link href={`/projects/${proj._id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Open Project <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No projects yet</p>
          )}
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-md border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-md border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group">
                <div className={`p-2.5 rounded-md ${link.color}`}>{link.icon}</div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 text-center">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent FCA */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Recent FCA Assessments</h3>
              <Link href="/fca" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {dashboard?.recent?.fcaAssessments?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recent.fcaAssessments.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.building?.name || "—"}</p>
                      <p className="text-xs text-gray-500">{item.assessor || "—"}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                      (item.facilityConditionIndex || 0) <= 0.1 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      FCI: {((item.facilityConditionIndex || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No assessments yet</p>
            )}
          </div>

          {/* Recent Budgets */}
          {/* Recent Budgets */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Recent Budgets</h3>
              <Link href="/budgets" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {dashboard?.recent?.budgets?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recent.budgets.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.budgetType} • FY{item.fiscalYear}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                      (item.totalVariance || 0) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {formatCurrency(item.totalVariance)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No budgets yet</p>
            )}
          </div>
        </div>
      </div>
      )}
    </Layout>
  );
}
