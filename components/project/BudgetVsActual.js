// components/project/BudgetVsActual.js
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from "recharts";
import { Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"];

export default function BudgetVsActual({ data = [], projectId, onUpdate }) {
  const budget = Array.isArray(data) ? data : [];
  const [editItems, setEditItems] = useState(null);
  const [saving, setSaving] = useState(false);

  const { chartData, totalBudget } = useMemo(() => {
    const total = budget.reduce((s, b) => s + (b.amount || 0), 0);
    const items = budget.map((b) => ({
      name: b.category || "Uncategorized",
      allocated: b.amount || 0,
      actual: b.actual || 0,
      percentage: total > 0 ? Math.round(((b.amount || 0) / total) * 100) : 0,
    }));
    return { chartData: items, totalBudget: total };
  }, [budget]);

  const startEdit = () => {
    setEditItems(budget.length > 0
      ? budget.map(b => ({ category: b.category || "", amount: b.amount || 0, actual: b.actual || 0 }))
      : [{ category: "", amount: 0, actual: 0 }]
    );
  };

  const handleSaveBudget = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: editItems.filter(i => i.category) }),
      });
      if (res.ok) {
        toast.success("Budget updated");
        setEditItems(null);
        onUpdate?.();
      }
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setSaving(false);
    }
  };

  if (budget.length === 0 && !editItems) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm mb-4">No budget data available for this project.</p>
        {projectId && (
          <button onClick={startEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus size={16} /> Add Budget Items
          </button>
        )}
      </div>
    );
  }

  if (editItems) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Project Budget</h3>
          <div className="flex gap-2">
            <button onClick={() => setEditItems(null)}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSaveBudget} disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          {editItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Category"
                  value={item.category} onChange={(e) => {
                    const u = [...editItems]; u[i] = { ...u[i], category: e.target.value }; setEditItems(u);
                  }} />
              </div>
              <div className="col-span-3">
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Budget"
                  value={item.amount} onChange={(e) => {
                    const u = [...editItems]; u[i] = { ...u[i], amount: Number(e.target.value) }; setEditItems(u);
                  }} />
              </div>
              <div className="col-span-3">
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Actual"
                  value={item.actual} onChange={(e) => {
                    const u = [...editItems]; u[i] = { ...u[i], actual: Number(e.target.value) }; setEditItems(u);
                  }} />
              </div>
              <div className="col-span-2 flex gap-1 justify-end">
                <span className={`text-xs font-medium ${(item.amount - item.actual) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {item.amount - item.actual >= 0 ? "+" : ""}₦{(item.amount - item.actual).toLocaleString()}
                </span>
                {editItems.length > 1 && (
                  <button onClick={() => setEditItems(editItems.filter((_, idx) => idx !== i))}
                    className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => setEditItems([...editItems, { category: "", amount: 0, actual: 0 }])}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>
    );
  }

  const totalActual = chartData.reduce((s, d) => s + (d.actual || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Project Budget</p>
          <p className="text-2xl font-bold text-gray-900">₦{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Actual</p>
          <p className="text-2xl font-bold text-emerald-600">₦{totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Variance</p>
          <p className={`text-2xl font-bold ${totalBudget - totalActual >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            ₦{Math.abs(totalBudget - totalActual).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Budget Categories</p>
          <p className="text-2xl font-bold text-blue-600">{budget.length}</p>
        </div>
      </div>

      {/* Edit Budget Button */}
      {projectId && (
        <div className="flex justify-end">
          <button onClick={startEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Edit Budget
          </button>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Actual by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [`₦${Number(v).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="allocated" fill="#3B82F6" name="Budget" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#22C55E" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="allocated" nameKey="name"
                cx="50%" cy="50%" outerRadius={100}
                label={({ name, percentage }) => `${name} (${percentage}%)`}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `₦${Number(v).toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Budget</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actual</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Variance</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">% of Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chartData.map((item, i) => {
              const variance = item.allocated - item.actual;
              const usagePercent = item.allocated > 0 ? Math.round((item.actual / item.allocated) * 100) : 0;
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    ₦{item.allocated.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    ₦{item.actual.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {variance >= 0 ? "+" : ""}₦{variance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {item.percentage}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div className={`h-2 rounded-full ${usagePercent > 100 ? "bg-red-500" : usagePercent > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{usagePercent}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                ₦{totalBudget.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                ₦{totalActual.toLocaleString()}
              </td>
              <td className={`px-4 py-3 text-sm font-bold text-right ${totalBudget - totalActual >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {totalBudget - totalActual >= 0 ? "+" : ""}₦{(totalBudget - totalActual).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">100%</td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
