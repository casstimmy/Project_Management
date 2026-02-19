import { useState, useEffect } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  ShieldCheck, Plus, Edit, Trash2, Eye, AlertTriangle,
  CheckCircle, XCircle, BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

const AUDIT_TYPES = [
  { value: "routine", label: "Routine" }, { value: "surprise", label: "Surprise" },
  { value: "follow-up", label: "Follow-up" }, { value: "external", label: "External" },
];

const HSSE_CATEGORIES = [
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
  const [form, setForm] = useState({
    site: "", building: "", auditType: "routine", auditDate: "",
    auditor: "", status: "draft", notes: "",
    checklist: HSSE_CATEGORIES.map(c => ({ category: c, item: c + " compliance check", status: "yes", remarks: "" })),
    risks: [],
  });

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
    fetch("/api/buildings").then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : []));
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hsse?${search ? `search=${search}` : ""}`);
      const data = await res.json();
      setAudits(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAudits(); }, [search]);

  const resetForm = () => setForm({
    site: "", building: "", auditType: "routine", auditDate: "",
    auditor: "", status: "draft", notes: "",
    checklist: HSSE_CATEGORIES.map(c => ({ category: c, item: c + " compliance check", status: "yes", remarks: "" })),
    risks: [],
  });

  const handleSubmit = async () => {
    if (!form.site) return toast.error("Site is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/hsse", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Audit updated" : "Audit created");
        setShowModal(false); setEditing(null); resetForm(); fetchAudits();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this audit?")) return;
    await fetch(`/api/hsse?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchAudits();
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
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Audit</Button></>}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Site" required>
                <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
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
              <FormField label="Auditor">
                <Input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} placeholder="Auditor name" />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "draft", label: "Draft" }, { value: "in-progress", label: "In Progress" }, { value: "completed", label: "Completed" }]} />
              </FormField>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Checklist Items</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {form.checklist.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-3">
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-gray-700">{item.category}</p>
                    </div>
                    <div className="col-span-3">
                      <Select value={item.status} onChange={(e) => {
                        const updated = [...form.checklist];
                        updated[i] = { ...updated[i], status: e.target.value };
                        setForm({ ...form, checklist: updated });
                      }} options={[
                        { value: "yes", label: "✓ Compliant" },
                        { value: "no", label: "✗ Non-Compliant" },
                        { value: "na", label: "N/A" },
                      ]} />
                    </div>
                    <div className="col-span-5">
                      <Input placeholder="Remarks" value={item.remarks} onChange={(e) => {
                        const updated = [...form.checklist];
                        updated[i] = { ...updated[i], remarks: e.target.value };
                        setForm({ ...form, checklist: updated });
                      }} />
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
                        <span className="text-sm text-gray-700">{item.category} — {item.item}</span>
                        <div className="flex items-center gap-2">
                          {item.status === "yes" ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : item.status === "no" ? (
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
