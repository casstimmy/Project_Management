import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, FormAlert,
} from "@/components/ui/SharedComponents";
import {
  Settings, Plus, Edit, Trash2, Calendar, Wrench,
  Clock, AlertTriangle, Package, Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { readApiError } from "@/lib/clientApi";

const FREQUENCIES = [
  { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-Weekly" }, { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" }, { value: "semi-annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" }, { value: "custom", label: "Custom" },
];

const MAINTENANCE_TYPES = [
  { value: "PPM", label: "Planned Preventive (PPM)" },
  { value: "PdM", label: "Predictive (PdM)" },
  { value: "RTF", label: "Run to Failure (RTF)" },
];

export default function MaintenancePage() {
  const [plans, setPlans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", asset: "", maintenanceType: "PPM",
    frequency: "monthly", status: "active",
    nextDueDate: "", estimatedCost: "", actualCost: "",
    documents: [],
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/assets").then(r => r.json()).then(d => setAssets(d.assets || (Array.isArray(d) ? d : [])));
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }) });
      const res = await fetch(`/api/maintenance?${q}`);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const resetForm = () => setForm({
    title: "", description: "", asset: "", maintenanceType: "PPM",
    frequency: "monthly", status: "active",
    nextDueDate: "", estimatedCost: "", actualCost: "",
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
      const res = await fetch("/api/maintenance", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Plan updated" : "Plan created");
        setShowModal(false); setEditing(null); resetForm(); fetchPlans();
      } else {
        const err = await readApiError(res, "Failed to save maintenance plan");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong while saving this maintenance plan.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/maintenance?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchPlans();
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      title: plan.title, description: plan.description || "",
      asset: plan.asset?._id || "", maintenanceType: plan.maintenanceType,
      frequency: plan.frequency, status: plan.status,
      nextDueDate: plan.nextDueDate?.split("T")[0] || "",
      estimatedCost: plan.estimatedCost || "",
      actualCost: plan.actualCost || "",
      documents: plan.documents || [],
    });
    setShowModal(true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

  const columns = [
    { header: "Plan", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
          <Settings size={16} className="text-purple-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400 capitalize">{row.maintenanceType} • {row.frequency}</p>
        </div>
      </div>
    )},
    { header: "Asset", render: (row) => <span className="text-gray-600 text-sm">{row.asset?.name || "—"}</span> },
    { header: "Type", render: (row) => (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">{row.maintenanceType}</span>
    )},
    { header: "Frequency", render: (row) => <span className="capitalize text-gray-600">{row.frequency}</span> },
    { header: "Next Due", render: (row) => {
      const d = row.nextDueDate ? new Date(row.nextDueDate) : null;
      const overdue = d && d < new Date();
      return (
        <span className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
          {overdue && "⚠ "}{formatDate(row.nextDueDate)}
        </span>
      );
    }},
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const activeCount = plans.filter(p => p.status === "active").length;
  const overdueCount = plans.filter(p => p.nextDueDate && new Date(p.nextDueDate) < new Date() && p.status === "active").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Maintenance Plans"
          subtitle="Schedule and manage preventive maintenance"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Maintenance" }, { label: "Plans" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Plan</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Settings size={20} />} label="Total Plans" value={plans.length} color="purple" />
          <StatCard icon={<Wrench size={20} />} label="Active" value={activeCount} color="green" />
          <StatCard icon={<AlertTriangle size={20} />} label="Overdue" value={overdueCount} color="red" />
          <StatCard icon={<Clock size={20} />} label="PPM Plans" value={plans.filter(p => p.maintenanceType === "PPM").length} color="blue" />
        </div>

        <DataTable columns={columns} data={plans} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search maintenance plans..." emptyMessage="No maintenance plans found." />

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Plan" : "New Maintenance Plan"} size="lg"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : (editing ? "Update" : "Create")}</Button></>}
        >
          <FormAlert message={submitError} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Plan Title" required className="md:col-span-2" error={fieldErrors.title}>
              <Input aria-invalid={!!fieldErrors.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Monthly HVAC Filter Change" />
            </FormField>
            <FormField label="Asset" error={fieldErrors.asset}>
              <Select aria-invalid={!!fieldErrors.asset} value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })}
                placeholder="Select asset" options={assets.map(a => ({ value: a._id, label: a.name }))} />
            </FormField>
            <FormField label="Maintenance Type" error={fieldErrors.maintenanceType}>
              <Select aria-invalid={!!fieldErrors.maintenanceType} value={form.maintenanceType} onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })} options={MAINTENANCE_TYPES} />
            </FormField>
            <FormField label="Frequency" error={fieldErrors.frequency}>
              <Select aria-invalid={!!fieldErrors.frequency} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} options={FREQUENCIES} />
            </FormField>
            <FormField label="Next Due Date">
              <Input type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} />
            </FormField>
            <FormField label="Estimated Cost (₦)">
              <Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} />
            </FormField>
            <FormField label="Actual Cost (₦)">
              <Input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[{ value: "active", label: "Active" }, { value: "paused", label: "Paused" }, { value: "completed", label: "Completed" }]} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>

            {/* Document Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
              {form.documents?.length > 0 && (
                <div className="space-y-1 mb-2">
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700 truncate">{doc.name || doc.url}</span>
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
      </div>
    </Layout>
  );
}
