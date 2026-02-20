// components/project/BudgetVsActual.js
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from "recharts";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"];

export default function BudgetVsActual({ data = [] }) {
  const budget = Array.isArray(data) ? data : [];

  const { chartData, totalBudget } = useMemo(() => {
    const total = budget.reduce((s, b) => s + (b.amount || 0), 0);
    const items = budget.map((b) => ({
      name: b.category || "Uncategorized",
      allocated: b.amount || 0,
      percentage: total > 0 ? Math.round(((b.amount || 0) / total) * 100) : 0,
    }));
    return { chartData: items, totalBudget: total };
  }, [budget]);

  if (budget.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">No budget data available for this project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Project Budget</p>
          <p className="text-2xl font-bold text-gray-900">₦{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Budget Categories</p>
          <p className="text-2xl font-bold text-blue-600">{budget.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Largest Category</p>
          <p className="text-2xl font-bold text-gray-900">
            {chartData.length > 0 ? chartData.reduce((a, b) => a.allocated > b.allocated ? a : b).name : "—"}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget Allocation by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [`₦${Number(v).toLocaleString()}`, "Amount"]} />
              <Bar dataKey="allocated" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
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
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">% of Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chartData.map((item, i) => (
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
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {item.percentage}%
                </td>
                <td className="px-4 py-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                ₦{totalBudget.toLocaleString()}
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
