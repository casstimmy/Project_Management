import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, FormAlert,
} from "@/components/ui/SharedComponents";
import {
  ShieldCheck, Plus, Edit, Trash2, Eye, AlertTriangle,
  CheckCircle, XCircle, BarChart3, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { readApiError } from "@/lib/clientApi";

const AUDIT_TYPES = [
  { value: "health-safety", label: "Health & Safety" }, { value: "security", label: "Security" },
  { value: "environment", label: "Environment" }, { value: "fire-safety", label: "Fire Safety" },
  { value: "comprehensive", label: "Comprehensive" },
];

const DEFAULT_HSSE_CATEGORIES = [
  "Fire Safety", "Electrical Safety", "Chemical Handling", "PPE Compliance",
  "Housekeeping", "Emergency Exits", "First Aid", "Signage",
  "Waste Management", "Environmental", "Ergonomics", "Fall Protection",
];

export default function HSSEPage() {
  const [audits, setAudits] = useState([]);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [hsseCategories, setHsseCategories] = useState(DEFAULT_HSSE_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [form, setForm] = useState({
    title: "", site: "", building: "", auditType: "comprehensive", auditDate: "",
    auditor: "", status: "draft", notes: "",
    checklist: DEFAULT_HSSE_CATEGORIES.map(c => ({ category: c, question: c + " compliance check", response: "yes", comments: "" })),
    risks: [],
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
    fetch("/api/buildings").then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : []));
  }, []);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hsse?${search ? `search=${search}` : ""}`);
      const data = await res.json();
      setAudits(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchAudits(); }, [fetchAudits]);

  const resetForm = () => {
    setForm({
      title: "", site: "", building: "", auditType: "comprehensive", auditDate: "",
      auditor: "", status: "draft", notes: "",
      checklist: hsseCategories.map(c => ({ category: c, question: c + " compliance check", response: "yes", comments: "" })),
      risks: [],
    });
    setNewCategoryName("");
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (form.checklist.some(c => c.category.toLowerCase() === name.toLowerCase())) {
      return toast.error("Category already exists");
    }
    setHsseCategories(prev => [...prev, name]);
    setForm(prev => ({
      ...prev,
      checklist: [...prev.checklist, { category: name, question: name + " compliance check", response: "yes", comments: "" }],
    }));
    setNewCategoryName("");
  };

  const handleRemoveCategory = (index) => {
    const catName = form.checklist[index]?.category;
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
    if (!DEFAULT_HSSE_CATEGORIES.includes(catName)) {
      setHsseCategories(prev => prev.filter(c => c !== catName));
    }
  };

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Audit title is required");
    if (!form.auditor) return toast.error("Auditor name is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      setSaving(true);
      setSubmitError("");
      setFieldErrors({});
      const res = await fetch("/api/hsse", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Audit updated" : "Audit created");
        setShowModal(false); setEditing(null); resetForm(); fetchAudits();
      } else {
        const err = await readApiError(res, "Failed to save HSSE audit");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong while saving this HSSE audit.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this audit?")) return;
    await fetch(`/api/hsse?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchAudits();
  };

  const openEdit = (audit) => {
    setEditing(audit);
    setForm({
      title: audit.title || "", site: audit.site?._id || "", building: audit.building?._id || "",
      auditType: audit.auditType || "comprehensive", auditDate: audit.auditDate?.split("T")[0] || "",
      auditor: audit.auditor || "", status: audit.status || "draft", notes: audit.notes || "",
      checklist: audit.checklist?.length ? audit.checklist.map(c => ({ category: c.category, question: c.question, response: c.response || "yes", comments: c.comments || "" })) : hsseCategories.map(c => ({ category: c, question: c + " compliance check", response: "yes", comments: "" })),
      risks: audit.risks || [],
    });
    setShowModal(true);
  };

  const getComplianceColor = (score) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50";
    if (score >= 70) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const columns = [
    { header: "Audit", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <ShieldCheck size={16} className="text-emerald-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.site?.name || "—"}</p>
          <p className="text-xs text-gray-400 capitalize">{row.auditType} • {row.auditDate ? new Date(row.auditDate).toLocaleDateString() : "—"}</p>
        </div>
      </div>
    )},
    { header: "Building", render: (row) => <span className="text-gray-600">{row.building?.name || "All"}</span> },
    { header: "Auditor", render: (row) => <span className="text-gray-600">{row.auditor || "—"}</span> },
    { header: "Compliance", render: (row) => {
      const score = row.complianceScore || 0;
      return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getComplianceColor(score)}`}>
          {score.toFixed(0)}%
        </span>
      );
    }},
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const avgCompliance = audits.length > 0
    ? audits.reduce((s, a) => s + (a.complianceScore || 0), 0) / audits.length : 0;
  const lowCompliance = audits.filter(a => (a.complianceScore || 0) < 70).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="HSSE Audit"
          subtitle="Health, Safety, Security & Environment audits"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Safety & Compliance" }, { label: "HSSE Audit" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Audit</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<ShieldCheck size={20} />} label="Total Audits" value={audits.length} color="blue" />
          <StatCard icon={<BarChart3 size={20} />} label="Avg Compliance" value={`${avgCompliance.toFixed(0)}%`} color={avgCompliance >= 80 ? "green" : "yellow"} />
          <StatCard icon={<AlertTriangle size={20} />} label="Low Compliance" value={lowCompliance} color="red" />
          <StatCard icon={<CheckCircle size={20} />} label="Completed" value={audits.filter(a => a.status === "completed").length} color="green" />
        </div>

        <DataTable columns={columns} data={audits} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search audits..." emptyMessage="No audits found." />

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title="HSSE Audit" size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save Audit"}</Button></>}
        >
          <FormAlert message={submitError} />
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Audit Title" required className="md:col-span-2" error={fieldErrors.title}>
                <Input aria-invalid={!!fieldErrors.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Q1 2025 Comprehensive HSSE Audit" />
              </FormField>
              <FormField label="Site" required error={fieldErrors.site}>
                <Select aria-invalid={!!fieldErrors.site} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
                  placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
              </FormField>
              <FormField label="Building">
                <Select value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}
                  placeholder="Select building (optional)" options={buildings.map(b => ({ value: b._id, label: b.name }))} />
              </FormField>
              <FormField label="Audit Type">
                <Select value={form.auditType} onChange={(e) => setForm({ ...form, auditType: e.target.value })} options={AUDIT_TYPES} />
              </FormField>
              <FormField label="Audit Date">
                <Input type="date" value={form.auditDate} onChange={(e) => setForm({ ...form, auditDate: e.target.value })} />
              </FormField>
              <FormField label="Auditor" required error={fieldErrors.auditor}>
                <Input aria-invalid={!!fieldErrors.auditor} value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} placeholder="Auditor name" />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "draft", label: "Draft" }, { value: "in-progress", label: "In Progress" }, { value: "completed", label: "Completed" }, { value: "approved", label: "Approved" }]} />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Checklist Items</h4>
              </div>
              {/* Add new checklist item */}
              <div className="flex items-center gap-2 mb-3">
                <Select
                  value=""
                  onChange={(e) => {
                    const name = e.target.value;
                    if (!name || form.checklist.some(c => c.category === name)) return;
                    setForm(prev => ({
                      ...prev,
                      checklist: [...prev.checklist, { category: name, question: name + " compliance check", response: "yes", comments: "" }],
                    }));
                  }}
                  placeholder="Add existing category..."
                  options={hsseCategories
                    .filter(c => !form.checklist.some(item => item.category === c))
                    .map(c => ({ value: c, label: c }))}
                />
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {form.checklist.map((item, i) => (
                  <div key={`${item.category}-${i}`} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-3">
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-700">{item.category}</p>
                    </div>
                    <div className="col-span-3">
                      <Select value={item.response} onChange={(e) => {
                        const updated = [...form.checklist];
                        updated[i] = { ...updated[i], response: e.target.value };
                        setForm({ ...form, checklist: updated });
                      }} options={[
                        { value: "yes", label: "✓ Compliant" },
                        { value: "no", label: "✗ Non-Compliant" },
                        { value: "na", label: "N/A" },
                      ]} />
                    </div>
                    <div className="col-span-5">
                      <Input placeholder="Comments" value={item.comments} onChange={(e) => {
                        const updated = [...form.checklist];
                        updated[i] = { ...updated[i], comments: e.target.value };
                        setForm({ ...form, checklist: updated });
                      }} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => handleRemoveCategory(i)} className="p-1 rounded hover:bg-red-100">
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField label="Notes">
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Audit Details" size="xl">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Site</p>
                  <p className="font-semibold text-sm">{showDetail.site?.name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-sm capitalize">{showDetail.auditType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Auditor</p>
                  <p className="font-semibold text-sm">{showDetail.auditor || "—"}</p>
                </div>
                <div className={`rounded-lg p-3 ${getComplianceColor(showDetail.complianceScore || 0)}`}>
                  <p className="text-xs opacity-70">Compliance</p>
                  <p className="font-bold text-lg">{(showDetail.complianceScore || 0).toFixed(0)}%</p>
                </div>
              </div>

              {showDetail.checklist?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Checklist Results</h4>
                  <div className="space-y-1">
                    {showDetail.checklist.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-sm text-gray-700">{item.category} — {item.question}</span>
                        <div className="flex items-center gap-2">
                          {item.response === "yes" ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : item.response === "no" ? (
                            <XCircle size={16} className="text-red-500" />
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                    ))}
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
