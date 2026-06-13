import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, FormAlert,
} from "@/components/ui/SharedComponents";
import {
  FileText, Plus, Edit, Trash2, Eye, Shield,
  Calendar, DollarSign, Upload, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { readApiError } from "@/lib/clientApi";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { formatCurrency } from "@/lib/currency";

const DOC_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "sla", label: "Service Level Agreement (SLA)" },
  { value: "governing-code", label: "Governing Code / Standard" },
  { value: "policy", label: "Policy" },
  { value: "regulation", label: "Regulation" },
];

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "under-review", label: "Under Review" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
];

export default function GovernancePage() {
  const [docs, setDocs] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", type: "contract", status: "draft", site: "",
    reference: "", description: "", notes: "",
    startDate: "", endDate: "", value: "",
    serviceLevel: "", responseTime: "", penalties: "",
    parties: [{ name: "", role: "" }],
    documents: [],
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWithAuth("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }), ...(typeFilter && { type: typeFilter }) });
      const res = await fetchWithAuth(`/api/governance?${q}`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, typeFilter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const resetForm = () => setForm({
    title: "", type: "contract", status: "draft", site: "",
    reference: "", description: "", notes: "",
    startDate: "", endDate: "", value: "",
    serviceLevel: "", responseTime: "", penalties: "",
    parties: [{ name: "", role: "" }],
    documents: [],
  });

  const handleSubmit = async () => {
    if (!form.title || !form.type) return toast.error("Title and type are required");
    const method = editing ? "PUT" : "POST";
    const cleanedForm = {
      ...form,
      parties: form.parties.filter(p => p.name?.trim()),
    };
    const payload = editing ? { ...cleanedForm, _id: editing._id } : cleanedForm;
    try {
      setSaving(true);
      setSubmitError("");
      setFieldErrors({});
      const res = await fetchWithAuth("/api/governance", {
        method, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Document updated" : "Document created");
        setShowModal(false); setEditing(null); resetForm(); fetchDocs();
      } else {
        const err = await readApiError(res, "Failed to save document");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    await fetchWithAuth(`/api/governance?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchDocs();
  };

  const addParty = () => {
    setForm({ ...form, parties: [...form.parties, { name: "", role: "" }] });
  };

  const updateParty = (i, field, value) => {
    const updated = [...form.parties];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, parties: updated });
  };

  const removeParty = (i) => {
    setForm({ ...form, parties: form.parties.filter((_, idx) => idx !== i) });
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({
      title: doc.title || "", type: doc.type || "contract", status: doc.status || "draft",
      site: doc.site?._id || "", reference: doc.reference || "",
      description: doc.description || "", notes: doc.notes || "",
      startDate: doc.startDate?.split("T")[0] || "",
      endDate: doc.endDate?.split("T")[0] || "",
      value: doc.value || "",
      serviceLevel: doc.serviceLevel || "",
      responseTime: doc.responseTime || "",
      penalties: doc.penalties || "",
      parties: doc.parties?.length ? doc.parties : [{ name: "", role: "" }],
      documents: doc.documents || [],
    });
    setShowModal(true);
  };

  const getTypeLabel = (t) => DOC_TYPES.find(d => d.value === t)?.label || t;

  const columns = [
    { header: "Document", render: (row) => (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          row.type === "contract" ? "bg-blue-50" : row.type === "sla" ? "bg-green-50" : "bg-purple-50"
        }`}>
          <FileText size={16} className={
            row.type === "contract" ? "text-blue-500" : row.type === "sla" ? "text-green-500" : "text-purple-500"
          } />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400">{row.reference || getTypeLabel(row.type)}</p>
        </div>
      </div>
    )},
    { header: "Type", render: (row) => <span className="text-sm text-gray-600 capitalize">{getTypeLabel(row.type)}</span> },
    { header: "Site", render: (row) => <span className="text-sm text-gray-600">{row.site?.name || "—"}</span> },
    { header: "End Date", render: (row) => {
      const d = row.endDate ? new Date(row.endDate) : null;
      const expired = d && d < new Date();
      return <span className={`text-sm ${expired ? "text-red-600 font-medium" : "text-gray-600"}`}>{d ? d.toLocaleDateString() : "—"}</span>;
    }},
    { header: "Value", render: (row) => <span className="text-sm text-gray-700">{row.value ? formatCurrency(row.value) : "—"}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const activeCount = docs.filter(d => d.status === "active").length;
  const expiredCount = docs.filter(d => d.status === "expired" || (d.endDate && new Date(d.endDate) < new Date())).length;
  const contractCount = docs.filter(d => d.type === "contract").length;
  const slaCount = docs.filter(d => d.type === "sla").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Contracts & Governance"
          subtitle="Manage contracts, SLAs, and governing codes"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Administration" }, { label: "Governance" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>Add Document</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FileText size={20} />} label="Total Documents" value={docs.length} color="blue" />
          <StatCard icon={<Shield size={20} />} label="Active" value={activeCount} color="green" />
          <StatCard icon={<AlertTriangle size={20} />} label="Expired" value={expiredCount} color="red" />
          <StatCard icon={<Calendar size={20} />} label="SLAs" value={slaCount} color="purple" />
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
          <button onClick={() => setTypeFilter("")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!typeFilter ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>All</button>
          {DOC_TYPES.map(t => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${typeFilter === t.value ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>{t.label}</button>
          ))}
        </div>

        <DataTable columns={columns} data={docs} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search documents..." emptyMessage="No governance documents found." />

        {/* Create / Edit Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Document" : "Add Governance Document"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : (editing ? "Update" : "Create")}</Button></>}
        >
          <FormAlert message={submitError} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Title" required className="md:col-span-2" error={fieldErrors.title}>
              <Input aria-invalid={!!fieldErrors.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Document title" />
            </FormField>
            <FormField label="Type" required>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={DOC_TYPES} />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
            </FormField>
            <FormField label="Reference Number">
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g., CTR-2025-001" />
            </FormField>
            <FormField label="Site">
              <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
                placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
            </FormField>
            <FormField label="Start Date">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </FormField>
            <FormField label="End Date">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </FormField>
            <FormField label="Contract Value (₦)">
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" />
            </FormField>

            {(form.type === "sla") && (
              <>
                <FormField label="Service Level">
                  <Input value={form.serviceLevel} onChange={(e) => setForm({ ...form, serviceLevel: e.target.value })} placeholder="e.g., 99.9% uptime" />
                </FormField>
                <FormField label="Response Time">
                  <Input value={form.responseTime} onChange={(e) => setForm({ ...form, responseTime: e.target.value })} placeholder="e.g., 4 hours" />
                </FormField>
                <FormField label="Penalties" className="md:col-span-2">
                  <Textarea rows={2} value={form.penalties} onChange={(e) => setForm({ ...form, penalties: e.target.value })} placeholder="Penalty clauses..." />
                </FormField>
              </>
            )}

            <FormField label="Description" className="md:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." />
            </FormField>

            {/* Parties */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Parties Involved</label>
                <button type="button" onClick={addParty} className="text-xs text-blue-600 hover:text-blue-700">+ Add Party</button>
              </div>
              {form.parties.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <Input placeholder="Name / Organization" value={p.name} onChange={(e) => updateParty(i, "name", e.target.value)} />
                  <Input placeholder="Role (e.g., Contractor)" value={p.role} onChange={(e) => updateParty(i, "role", e.target.value)} />
                  {form.parties.length > 1 && (
                    <button type="button" onClick={() => removeParty(i)} className="p-1.5 rounded hover:bg-red-50">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Document Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
              {form.documents?.length > 0 && (
                <div className="space-y-1 mb-2">
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 truncate hover:underline">{doc.name || doc.url}</a>
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
                    const res = await axios.post('/api/upload', formData, {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
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

            <FormField label="Notes" className="md:col-span-2">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Document Details" size="lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Title</p><p className="font-medium">{showDetail.title}</p></div>
                <div><p className="text-xs text-gray-500">Type</p><p className="font-medium capitalize">{getTypeLabel(showDetail.type)}</p></div>
                <div><p className="text-xs text-gray-500">Reference</p><p>{showDetail.reference || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={showDetail.status} /></div>
                <div><p className="text-xs text-gray-500">Start Date</p><p>{showDetail.startDate ? new Date(showDetail.startDate).toLocaleDateString() : "—"}</p></div>
                <div><p className="text-xs text-gray-500">End Date</p><p>{showDetail.endDate ? new Date(showDetail.endDate).toLocaleDateString() : "—"}</p></div>
                <div><p className="text-xs text-gray-500">Value</p><p>{showDetail.value ? formatCurrency(showDetail.value) : "—"}</p></div>
                <div><p className="text-xs text-gray-500">Site</p><p>{showDetail.site?.name || "—"}</p></div>
              </div>
              {showDetail.description && <div><p className="text-xs text-gray-500">Description</p><p className="text-sm mt-1">{showDetail.description}</p></div>}
              {showDetail.type === "sla" && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg">
                  <div><p className="text-xs text-gray-500">Service Level</p><p className="text-sm">{showDetail.serviceLevel || "—"}</p></div>
                  <div><p className="text-xs text-gray-500">Response Time</p><p className="text-sm">{showDetail.responseTime || "—"}</p></div>
                  {showDetail.penalties && <div className="col-span-2"><p className="text-xs text-gray-500">Penalties</p><p className="text-sm">{showDetail.penalties}</p></div>}
                </div>
              )}
              {showDetail.parties?.length > 0 && (
                <div><p className="text-xs text-gray-500 mb-1">Parties</p>
                  {showDetail.parties.map((p, i) => (
                    <p key={i} className="text-sm">{p.name} — <span className="text-gray-500">{p.role}</span></p>
                  ))}
                </div>
              )}
              {showDetail.documents?.length > 0 && (
                <div><p className="text-xs text-gray-500 mb-1">Attachments</p>
                  {showDetail.documents.map((d, i) => (
                    <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">{d.name}</a>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
