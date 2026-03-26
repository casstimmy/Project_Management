// components/project/BudgetVsActual.js
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from "recharts";
import { Plus, Trash2, Save, X, Receipt, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, formatNumber, formatCompactCurrency } from "@/lib/currency";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#F97316"];

const DEFAULT_CATEGORIES = [
  "Labor / Manpower", "Materials & Supplies", "Equipment Rental",
  "Subcontractor Fees", "Permits & Licenses", "Transportation",
  "Utilities", "Safety & PPE", "Quality Assurance", "Insurance",
  "Contingency / Reserve", "Design & Engineering", "Supervision & Management",
  "IT & Communication", "Environmental Compliance", "Other",
];

const DEFAULT_EXPENSE_TYPES = [
  "Task Cost", "Material Purchase", "Equipment Hire", "Labor Wages",
  "Travel & Transport", "Consultation Fee", "Permit Fee", "Fuel & Diesel",
  "Office Supplies", "Communication", "Repairs", "Miscellaneous",
];

export default function BudgetVsActual({ data = [], projectId, tasks = [], onUpdate }) {
  const budget = Array.isArray(data) ? data : [];
  const [editItems, setEditItems] = useState(null);
  const [saving, setSaving] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Expense tracking state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [customExpenseTypes, setCustomExpenseTypes] = useState([]);
  const [showAddExpenseType, setShowAddExpenseType] = useState(false);
  const [newExpenseType, setNewExpenseType] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    type: "", category: "", description: "", amount: 0, taskId: "",
  });

  // Active tab
  const [activeTab, setActiveTab] = useState("overview");

  const allCategories = useMemo(() => {
    const existing = budget.map(b => b.category).filter(Boolean);
    return [...new Set([...DEFAULT_CATEGORIES, ...existing, ...customCategories])];
  }, [budget, customCategories]);

  const allExpenseTypes = useMemo(() => {
    const existing = expenses.map(e => e.type).filter(Boolean);
    return [...new Set([...DEFAULT_EXPENSE_TYPES, ...existing, ...customExpenseTypes])];
  }, [expenses, customExpenseTypes]);

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (allCategories.includes(name)) return toast.error("Category already exists");
    setCustomCategories(prev => [...prev, name]);
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const handleAddExpenseType = () => {
    const name = newExpenseType.trim();
    if (!name) return;
    if (allExpenseTypes.includes(name)) return toast.error("Expense type already exists");
    setCustomExpenseTypes(prev => [...prev, name]);
    setNewExpenseType("");
    setShowAddExpenseType(false);
  };

  const handleAddExpense = () => {
    if (!expenseForm.type || !expenseForm.amount) return toast.error("Type and amount are required");
    setExpenses(prev => [...prev, { ...expenseForm, id: Date.now() }]);
    setExpenseForm({ type: "", category: "", description: "", amount: 0, taskId: "" });
    toast.success("Expense added");
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Calculate task-based costs
  const taskCosts = useMemo(() => {
    return expenses.filter(e => e.taskId).reduce((acc, e) => {
      acc[e.taskId] = (acc[e.taskId] || 0) + (e.amount || 0);
      return acc;
    }, {});
  }, [expenses]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);

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

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "expenses", label: "Expenses & Costs" },
    { key: "tasks", label: "Task Costs" },
  ];

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
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  value={item.category} onChange={(e) => {
                    const u = [...editItems]; u[i] = { ...u[i], category: e.target.value }; setEditItems(u);
                  }}>
                  <option value="">Select Category</option>
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
                  {item.amount - item.actual >= 0 ? "+" : ""}{formatCurrency(item.amount - item.actual)}
                </span>
                {editItems.length > 1 && (
                  <button onClick={() => setEditItems(editItems.filter((_, idx) => idx !== i))}
                    className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => setEditItems([...editItems, { category: "", amount: 0, actual: 0 }])}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <Plus size={14} /> Add Item
            </button>
            {showAddCategory ? (
              <div className="flex items-center gap-2">
                <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" placeholder="New category name"
                  value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} />
                <button onClick={handleAddCategory} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Add</button>
                <button onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }} className="p-0.5 rounded hover:bg-gray-100"><X size={14} className="text-gray-400" /></button>
              </div>
            ) : (
              <button onClick={() => setShowAddCategory(true)}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <Plus size={14} /> New Category
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalActual = chartData.reduce((s, d) => s + (d.actual || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Actual</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalActual)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Expenses Logged</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Variance</p>
          <p className={`text-2xl font-bold ${totalBudget - totalActual >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrency(Math.abs(totalBudget - totalActual))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Categories</p>
          <p className="text-2xl font-bold text-blue-600">{budget.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Actual by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                  <Tooltip formatter={(v) => [formatCurrency(v), ""]} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#3B82F6" name="Budget" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#22C55E" name="Actual" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                  <Tooltip formatter={(v) => formatCurrency(v)} />
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
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.allocated)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.actual)}</td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.percentage}%</td>
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
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(totalBudget)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(totalActual)}</td>
                  <td className={`px-4 py-3 text-sm font-bold text-right ${totalBudget - totalActual >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {totalBudget - totalActual >= 0 ? "+" : ""}{formatCurrency(totalBudget - totalActual)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">100%</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          {/* Add Expense Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Receipt size={16} className="text-orange-500" /> Add Expense
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Expense Type</label>
                <div className="flex gap-1">
                  <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={expenseForm.type} onChange={(e) => setExpenseForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="">Select type...</option>
                    {allExpenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {!showAddExpenseType && (
                    <button onClick={() => setShowAddExpenseType(true)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50" title="Add new type">
                      <Plus size={14} className="text-gray-500" />
                    </button>
                  )}
                </div>
                {showAddExpenseType && (
                  <div className="flex gap-1 mt-1">
                    <input className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs" placeholder="New type"
                      value={newExpenseType} onChange={(e) => setNewExpenseType(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddExpenseType()} />
                    <button onClick={handleAddExpenseType} className="text-xs text-emerald-600 font-medium px-2">Add</button>
                    <button onClick={() => { setShowAddExpenseType(false); setNewExpenseType(""); }}
                      className="p-1 rounded hover:bg-gray-100"><X size={12} className="text-gray-400" /></button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Budget Category</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  value={expenseForm.category} onChange={(e) => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category...</option>
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Linked Task</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  value={expenseForm.taskId} onChange={(e) => setExpenseForm(f => ({ ...f, taskId: e.target.value }))}>
                  <option value="">No task (general)</option>
                  {tasks.filter(t => typeof t === "object").map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₦)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0"
                  value={expenseForm.amount || ""} onChange={(e) => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))} />
              </div>

              <div className="flex items-end">
                <button onClick={handleAddExpense}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  <Plus size={14} /> Add Expense
                </button>
              </div>
            </div>
            <div className="mt-2">
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description (optional)"
                value={expenseForm.description} onChange={(e) => setExpenseForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>

          {/* Expenses Table */}
          {expenses.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((exp) => {
                    const task = tasks.find(t => typeof t === "object" && t._id === exp.taskId);
                    return (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">{exp.type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{exp.category || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task?.name || "General"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{exp.description || "—"}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(exp.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900">Total Expenses</td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-600 text-right">{formatCurrency(totalExpenses)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Receipt size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No expenses logged yet. Use the form above to add expenses.</p>
            </div>
          )}
        </div>
      )}

      {/* Task Costs Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <ClipboardList size={16} className="text-blue-500" /> Cost by Task
            </h3>
            {tasks.filter(t => typeof t === "object").length > 0 ? (
              <div className="space-y-2">
                {tasks.filter(t => typeof t === "object").map(task => {
                  const cost = taskCosts[task._id] || 0;
                  const statusColors = {
                    done: "bg-emerald-50 text-emerald-700",
                    inprogress: "bg-blue-50 text-blue-700",
                    todo: "bg-gray-100 text-gray-600",
                    review: "bg-purple-50 text-purple-700",
                    blocked: "bg-red-50 text-red-700",
                  };
                  return (
                    <div key={task._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[task.status] || "bg-gray-100"}`}>
                          {task.status}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.name}</p>
                          {task.assignee?.name && (
                            <p className="text-xs text-gray-400">{task.assignee.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${cost > 0 ? "text-orange-600" : "text-gray-400"}`}>
                          {formatCurrency(cost)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {expenses.filter(e => e.taskId === task._id).length} expense{expenses.filter(e => e.taskId === task._id).length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 mt-2">
                  <span className="text-sm font-bold text-gray-900">Total Task Costs</span>
                  <span className="text-sm font-bold text-orange-600">{formatCurrency(Object.values(taskCosts).reduce((s, v) => s + v, 0))}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No tasks in this project yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
