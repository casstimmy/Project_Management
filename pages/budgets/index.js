import { useState, useEffect } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, Tabs,
} from "@/components/ui/SharedComponents";
import {
  DollarSign, Plus, Edit, Trash2, Eye, TrendingUp,
  TrendingDown, BarChart3, PieChart,
} from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as ReChart, Pie, Cell } from "recharts";

const OPEX_CATEGORIES = [
  "Utilities", "Cleaning", "Security", "Landscaping", "Waste Management",
  "Pest Control", "Consumables", "Insurance", "Admin & Management Fees",
  "Repair & Maintenance", "Staffing", "Training", "Other OPEX",
];

const CAPEX_CATEGORIES = [
  "Major Refurbishment", "Equipment Replacement", "New Installation",
  "Building Extension", "IT Infrastructure", "Safety Upgrades",
  "Energy Efficiency", "Compliance Upgrades", "Other CAPEX",
];

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    title: "", budgetType: "OPEX", fiscalYear: new Date().getFullYear().toString(),
    site: "", costCenter: "", status: "draft", notes: "",
    lineItems: [{ description: "", category: "", budgeted: 0, actual: 0 }],
  });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?${search ? `search=${search}` : ""}`);
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [search]);

  const resetForm = () => setForm({
    title: "", budgetType: "OPEX", fiscalYear: new Date().getFullYear().toString(),
    site: "", costCenter: "", status: "draft", notes: "",
    lineItems: [{ description: "", category: "", budgeted: 0, actual: 0 }],
  });

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Title is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/budgets", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Budget updated" : "Budget created");
        setShowModal(false); setEditing(null); resetForm(); fetchBudgets();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchBudgets();
  };

  const addLineItem = () => {
    setForm({ ...form, lineItems: [...form.lineItems, { description: "", category: "", budgeted: 0, actual: 0 }] });
  };

  const updateLineItem = (i, field, value) => {
    const updated = [...form.lineItems];
    updated[i] = { ...updated[i], [field]: field === "budgeted" || field === "actual" ? Number(value) : value };
    setForm({ ...form, lineItems: updated });
  };

  const removeLineItem = (i) => {
    setForm({ ...form, lineItems: form.lineItems.filter((_, idx) => idx !== i) });
  };

  const formatCurrency = (v) => v ? `$${Number(v).toLocaleString()}` : "$0";

  const totalBudgeted = budgets.reduce((s, b) => s + (b.totalBudgeted || 0), 0);
  const totalActual = budgets.reduce((s, b) => s + (b.totalActual || 0), 0);
  const totalVariance = totalBudgeted - totalActual;

  // Chart data
  const budgetByType = [
    { name: "OPEX", budgeted: budgets.filter(b => b.budgetType === "OPEX").reduce((s, b) => s + (b.totalBudgeted || 0), 0), actual: budgets.filter(b => b.budgetType === "OPEX").reduce((s, b) => s + (b.totalActual || 0), 0) },
    { name: "CAPEX", budgeted: budgets.filter(b => b.budgetType === "CAPEX").reduce((s, b) => s + (b.totalBudgeted || 0), 0), actual: budgets.filter(b => b.budgetType === "CAPEX").reduce((s, b) => s + (b.totalActual || 0), 0) },
  ];

  const columns = [
    { header: "Budget", render: (row) => (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.budgetType === "OPEX" ? "bg-blue-50" : "bg-purple-50"}`}>
          <DollarSign size={16} className={row.budgetType === "OPEX" ? "text-blue-500" : "text-purple-500"} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400">{row.budgetType} • FY{row.fiscalYear}</p>
        </div>
      </div>
    )},
    { header: "Budgeted", render: (row) => <span className="font-medium text-gray-700">{formatCurrency(row.totalBudgeted)}</span> },
    { header: "Actual", render: (row) => <span className="font-medium text-gray-700">{formatCurrency(row.totalActual)}</span> },
    { header: "Variance", render: (row) => {
      const v = (row.totalBudgeted || 0) - (row.totalActual || 0);
      return (
        <span className={`font-medium ${v >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {v >= 0 ? "+" : ""}{formatCurrency(v)}
        </span>
      );
    }},
    { header: "Items", render: (row) => <span className="text-gray-600">{row.lineItems?.length || 0}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Budgets & Finance"
          subtitle="OPEX and CAPEX budget management"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Budgets & Finance" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Budget</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<DollarSign size={20} />} label="Total Budgeted" value={formatCurrency(totalBudgeted)} color="blue" />
          <StatCard icon={<BarChart3 size={20} />} label="Total Actual" value={formatCurrency(totalActual)} color="purple" />
          <StatCard icon={totalVariance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />} label="Total Variance"
            value={formatCurrency(Math.abs(totalVariance))} color={totalVariance >= 0 ? "green" : "red"}
            subtext={totalVariance >= 0 ? "Under budget" : "Over budget"} />
          <StatCard icon={<PieChart size={20} />} label="Budget Count" value={budgets.length} color="indigo" />
        </div>

        {/* Budget vs Actual Chart */}
        {budgets.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Actual by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={budgetByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <DataTable columns={columns} data={budgets} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search budgets..." emptyMessage="No budgets found." />

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Budget" : "New Budget"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button></>}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Title" required className="md:col-span-2">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., FY2025 Building Maintenance OPEX" />
              </FormField>
              <FormField label="Budget Type">
                <Select value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value })}
                  options={[{ value: "OPEX", label: "OPEX (Operational)" }, { value: "CAPEX", label: "CAPEX (Capital)" }]} />
              </FormField>
              <FormField label="Fiscal Year">
                <Input value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })} />
              </FormField>
              <FormField label="Cost Center">
                <Input value={form.costCenter} onChange={(e) => setForm({ ...form, costCenter: e.target.value })} placeholder="e.g., FM-OPS-001" />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "draft", label: "Draft" }, { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Line Items</h4>
                <Button variant="ghost" size="xs" icon={<Plus size={14} />} onClick={addLineItem}>Add Item</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {form.lineItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 bg-gray-50 rounded-lg p-3 items-center">
                    <div className="col-span-3">
                      <Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(i, "description", e.target.value)} />
                    </div>
                    <div className="col-span-3">
                      <Select value={item.category} onChange={(e) => updateLineItem(i, "category", e.target.value)}
                        placeholder="Category"
                        options={(form.budgetType === "OPEX" ? OPEX_CATEGORIES : CAPEX_CATEGORIES).map(c => ({ value: c, label: c }))} />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Budgeted" value={item.budgeted} onChange={(e) => updateLineItem(i, "budgeted", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Actual" value={item.actual} onChange={(e) => updateLineItem(i, "actual", e.target.value)} />
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`text-xs font-medium ${(item.budgeted - item.actual) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {item.budgeted - item.actual >= 0 ? "+" : ""}{(item.budgeted - item.actual).toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      {form.lineItems.length > 1 && (
                        <button onClick={() => removeLineItem(i)} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-end gap-6 text-sm">
                <span className="text-gray-500">Total Budgeted: <span className="font-semibold text-gray-900">{formatCurrency(form.lineItems.reduce((s, li) => s + li.budgeted, 0))}</span></span>
                <span className="text-gray-500">Total Actual: <span className="font-semibold text-gray-900">{formatCurrency(form.lineItems.reduce((s, li) => s + li.actual, 0))}</span></span>
              </div>
            </div>

            <FormField label="Notes">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || "Budget Detail"} size="xl">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">{showDetail.budgetType}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-500">Budgeted</p>
                  <p className="font-bold text-blue-700">{formatCurrency(showDetail.totalBudgeted)}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-500">Actual</p>
                  <p className="font-bold text-emerald-700">{formatCurrency(showDetail.totalActual)}</p>
                </div>
                <div className={`rounded-lg p-3 ${(showDetail.totalVariance || 0) >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                  <p className="text-xs opacity-70">Variance</p>
                  <p className={`font-bold ${(showDetail.totalVariance || 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {formatCurrency(showDetail.totalVariance)}
                  </p>
                </div>
              </div>

              {showDetail.lineItems?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Line Items</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Description</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Budgeted</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Actual</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showDetail.lineItems.map((li, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="px-3 py-2 text-gray-700">{li.description}</td>
                            <td className="px-3 py-2 text-gray-600">{li.category}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(li.budgeted)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(li.actual)}</td>
                            <td className={`px-3 py-2 text-right font-medium ${(li.variance || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {formatCurrency(li.variance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
