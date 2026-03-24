import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, Tabs, FormAlert,
} from "@/components/ui/SharedComponents";
import {
  DollarSign, Plus, Edit, Trash2, Eye, TrendingUp,
  TrendingDown, BarChart3, PieChart, Calculator, MapPin, Upload,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as ReChart, Pie, Cell } from "recharts";
import { readApiError } from "@/lib/clientApi";

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
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showProjection, setShowProjection] = useState(false);
  const [inflationRate, setInflationRate] = useState(5);
  const [projectionYears, setProjectionYears] = useState(3);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    title: "", budgetType: "OPEX", fiscalYear: new Date().getFullYear().toString(),
    site: "", building: "", costCenter: "", status: "draft", notes: "",
    lineItems: [{ description: "", category: "", budgetedAmount: 0, actualAmount: 0 }],
    documents: [],
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?${search ? `search=${search}` : ""}`);
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.site) {
      fetch(`/api/buildings?siteId=${form.site}`).then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : [])).catch(() => {});
    } else {
      setBuildings([]);
    }
  }, [form.site]);

  const resetForm = () => setForm({
    title: "", budgetType: "OPEX", fiscalYear: new Date().getFullYear().toString(),
    site: "", building: "", costCenter: "", status: "draft", notes: "",
    lineItems: [{ description: "", category: "", budgetedAmount: 0, actualAmount: 0 }],
    documents: [],
  });

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Title is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      setSaving(true);
      setSubmitError("");
      setFieldErrors({});
      const res = await fetch("/api/budgets", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Budget updated" : "Budget created");
        setShowModal(false); setEditing(null); resetForm(); fetchBudgets();
      } else {
        const err = await readApiError(res, "Failed to save budget");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong while saving this budget.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchBudgets();
  };

  const addLineItem = () => {
    setForm({ ...form, lineItems: [...form.lineItems, { description: "", category: "", budgetedAmount: 0, actualAmount: 0 }] });
  };

  const updateLineItem = (i, field, value) => {
    const updated = [...form.lineItems];
    updated[i] = { ...updated[i], [field]: field === "budgetedAmount" || field === "actualAmount" ? Number(value) : value };
    setForm({ ...form, lineItems: updated });
  };

  const removeLineItem = (i) => {
    setForm({ ...form, lineItems: form.lineItems.filter((_, idx) => idx !== i) });
  };

  const formatCurrency = (v) => v ? `₦${Number(v).toLocaleString()}` : "₦0";

  const totalBudgeted = budgets.reduce((s, b) => s + (b.totalBudgeted || 0), 0);
  const totalActual = budgets.reduce((s, b) => s + (b.totalActual || 0), 0);
  const totalVariance = totalBudgeted - totalActual;

  // Chart data - year by year breakdown
  const budgetByType = [
    { name: "OPEX", budgeted: budgets.filter(b => b.budgetType === "OPEX").reduce((s, b) => s + (b.totalBudgeted || 0), 0), actual: budgets.filter(b => b.budgetType === "OPEX").reduce((s, b) => s + (b.totalActual || 0), 0) },
    { name: "CAPEX", budgeted: budgets.filter(b => b.budgetType === "CAPEX").reduce((s, b) => s + (b.totalBudgeted || 0), 0), actual: budgets.filter(b => b.budgetType === "CAPEX").reduce((s, b) => s + (b.totalActual || 0), 0) },
  ];

  // Year-over-year data for trend analysis
  const yearlyData = (() => {
    const years = [...new Set(budgets.map(b => b.fiscalYear))].sort();
    return years.map(year => {
      const yBudgets = budgets.filter(b => b.fiscalYear === year);
      return {
        year: `FY${year}`,
        opexBudgeted: yBudgets.filter(b => b.budgetType === "OPEX").reduce((s, b) => s + (b.totalBudgeted || 0), 0),
        opexActual: yBudgets.filter(b => b.budgetType === "OPEX").reduce((s, b) => s + (b.totalActual || 0), 0),
        capexBudgeted: yBudgets.filter(b => b.budgetType === "CAPEX").reduce((s, b) => s + (b.totalBudgeted || 0), 0),
        capexActual: yBudgets.filter(b => b.budgetType === "CAPEX").reduce((s, b) => s + (b.totalActual || 0), 0),
      };
    });
  })();

  // Budget projections from historical data
  const projections = (() => {
    const years = [...new Set(budgets.map(b => b.fiscalYear))].sort();
    if (years.length < 1) return [];
    const latestYear = Math.max(...years);
    const opexLatest = budgets.filter(b => b.budgetType === "OPEX" && b.fiscalYear === latestYear).reduce((s, b) => s + (b.totalActual || b.totalBudgeted || 0), 0);
    const capexLatest = budgets.filter(b => b.budgetType === "CAPEX" && b.fiscalYear === latestYear).reduce((s, b) => s + (b.totalActual || b.totalBudgeted || 0), 0);

    const result = [];
    for (let i = 1; i <= projectionYears; i++) {
      const factor = Math.pow(1 + inflationRate / 100, i);
      result.push({
        year: `FY${latestYear + i}`,
        projectedOpex: Math.round(opexLatest * factor),
        projectedCapex: Math.round(capexLatest * factor),
        total: Math.round((opexLatest + capexLatest) * factor),
        inflationFactor: `${(factor * 100 - 100).toFixed(1)}%`,
      });
    }
    return result;
  })();

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
    { header: "Location", render: (row) => (
      <span className="text-sm text-gray-600">{row.site?.name || "—"}</span>
    )},
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
          actions={<div className="flex gap-2">
            <Button variant="secondary" icon={<Calculator size={16} />} onClick={() => setShowProjection(true)}>Projections</Button>
            <Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Budget</Button>
          </div>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<DollarSign size={20} />} label="Total Budgeted" value={formatCurrency(totalBudgeted)} color="blue" />
          <StatCard icon={<BarChart3 size={20} />} label="Total Actual" value={formatCurrency(totalActual)} color="purple" />
          <StatCard icon={totalVariance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />} label="Total Variance"
            value={formatCurrency(Math.abs(totalVariance))} color={totalVariance >= 0 ? "green" : "red"}
            subtext={totalVariance >= 0 ? "Under budget" : "Over budget"} />
          <StatCard icon={<PieChart size={20} />} label="Budget Count" value={budgets.length} color="indigo" />
        </div>

        {/* Budget vs Actual Charts */}
        {budgets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Actual by Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {yearlyData.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Year-over-Year Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="opexActual" fill="#3B82F6" name="OPEX" radius={[4, 4, 0, 0]} stackId="actual" />
                    <Bar dataKey="capexActual" fill="#8B5CF6" name="CAPEX" radius={[4, 4, 0, 0]} stackId="actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <DataTable columns={columns} data={budgets} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search budgets..." emptyMessage="No budgets found." />

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Budget" : "New Budget"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : (editing ? "Update" : "Create")}</Button></>}
        >
          <FormAlert message={submitError} />
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Title" required className="md:col-span-2" error={fieldErrors.title}>
                <Input aria-invalid={!!fieldErrors.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., FY2025 Building Maintenance OPEX" />
              </FormField>
              <FormField label="Budget Type">
                <Select value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value })}
                  options={[{ value: "OPEX", label: "OPEX (Operational)" }, { value: "CAPEX", label: "CAPEX (Capital)" }]} />
              </FormField>
              <FormField label="Fiscal Year" error={fieldErrors.fiscalYear}>
                <Select value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                  options={Array.from({ length: 11 }, (_, i) => {
                    const y = new Date().getFullYear() - 5 + i;
                    return { value: y.toString(), label: `FY ${y}` };
                  })} />
              </FormField>
              <FormField label="Cost Center">
                <Input value={form.costCenter} onChange={(e) => setForm({ ...form, costCenter: e.target.value })} placeholder="e.g., FM-OPS-001" />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "draft", label: "Draft" }, { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} />
              </FormField>
              <FormField label="Site / Location">
                <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value, building: "" })}
                  placeholder="Select site (optional)" options={sites.map(s => ({ value: s._id, label: s.name }))} />
              </FormField>
              <FormField label="Building">
                <Select value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}
                  placeholder="Select building (optional)" options={buildings.map(b => ({ value: b._id, label: b.name }))} />
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
                      <Input type="number" placeholder="Budgeted" value={item.budgetedAmount} onChange={(e) => updateLineItem(i, "budgetedAmount", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Actual" value={item.actualAmount} onChange={(e) => updateLineItem(i, "actualAmount", e.target.value)} />
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`text-xs font-medium ${(item.budgetedAmount - item.actualAmount) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {item.budgetedAmount - item.actualAmount >= 0 ? "+" : ""}{(item.budgetedAmount - item.actualAmount).toLocaleString()}
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
                <span className="text-gray-500">Total Budgeted: <span className="font-semibold text-gray-900">{formatCurrency(form.lineItems.reduce((s, li) => s + li.budgetedAmount, 0))}</span></span>
                <span className="text-gray-500">Total Actual: <span className="font-semibold text-gray-900">{formatCurrency(form.lineItems.reduce((s, li) => s + li.actualAmount, 0))}</span></span>
              </div>
            </div>

            <FormField label="Notes">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </FormField>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
              {form.documents?.length > 0 && (
                <div className="space-y-1 mb-2">
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">{doc.name || doc.url}</a>
                      <button type="button" onClick={() => setForm({ ...form, documents: form.documents.filter((_, idx) => idx !== i) })} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Document'}
                <input type="file" className="hidden" disabled={uploading} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await axios.post('/api/upload', formData);
                    const url = res.data.links?.[0];
                    if (url) {
                      setForm(prev => ({ ...prev, documents: [...(prev.documents || []), { name: file.name, url }] }));
                      toast.success('Document uploaded');
                    }
                  } catch { toast.error('Upload failed'); }
                  finally { setUploading(false); e.target.value = ''; }
                }} />
              </label>
            </div>
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

              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/budgets?id=${showDetail._id}`, { method: "PATCH" });
                      if (res.ok) {
                        const data = await res.json();
                        toast.success(`Synced actuals from ${data.projectCount} project(s)`);
                        setShowDetail(null);
                        fetchBudgets();
                      } else {
                        toast.error("Failed to sync");
                      }
                    } catch {
                      toast.error("Failed to sync from projects");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50"
                >
                  <TrendingUp size={14} /> Sync Actuals from Projects
                </button>
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

        {/* Budget Projection Modal */}
        <Modal isOpen={showProjection} onClose={() => setShowProjection(false)} title="Budget Projections" size="xl">
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              Project future OPEX and CAPEX budgets based on historical data adjusted for economic factors.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Annual Inflation Rate (%)">
                <Input type="number" min="0" max="50" step="0.5" value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))} />
              </FormField>
              <FormField label="Projection Years">
                <Select value={projectionYears} onChange={(e) => setProjectionYears(Number(e.target.value))}
                  options={[{ value: 1, label: "1 Year" }, { value: 2, label: "2 Years" }, { value: 3, label: "3 Years" }, { value: 5, label: "5 Years" }]} />
              </FormField>
            </div>

            {projections.length > 0 ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Year</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Projected OPEX</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Projected CAPEX</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Inflation Adj.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projections.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{p.year}</td>
                          <td className="px-4 py-3 text-right text-blue-700 font-medium">{formatCurrency(p.projectedOpex)}</td>
                          <td className="px-4 py-3 text-right text-purple-700 font-medium">{formatCurrency(p.projectedCapex)}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(p.total)}</td>
                          <td className="px-4 py-3 text-right text-amber-600">+{p.inflationFactor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Projected Budget Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="projectedOpex" fill="#3B82F6" name="OPEX" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="projectedCapex" fill="#8B5CF6" name="CAPEX" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calculator size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Add budget data to generate projections.</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
