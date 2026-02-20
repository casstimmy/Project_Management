import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge, PriorityBadge,
  Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  AlertOctagon, Plus, Edit, Trash2, Eye, AlertTriangle,
  Users, Calendar, Shield,
} from "lucide-react";
import toast from "react-hot-toast";

const INCIDENT_TYPES = [
  { value: "injury", label: "Injury" }, { value: "near-miss", label: "Near Miss" },
  { value: "property-damage", label: "Property Damage" }, { value: "fire", label: "Fire" },
  { value: "environmental", label: "Environmental" }, { value: "security-breach", label: "Security Breach" },
  { value: "equipment-failure", label: "Equipment Failure" },
];

const SEVERITIES = [
  { value: "minor", label: "Minor" }, { value: "moderate", label: "Moderate" },
  { value: "major", label: "Major" }, { value: "critical", label: "Critical" },
  { value: "fatal", label: "Fatal" },
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", type: "near-miss", severity: "minor", status: "reported",
    site: "", building: "", location: "",
    dateOccurred: "", description: "", immediateActions: "",
    personsInvolved: "", witnesses: "",
    rootCause: "", correctiveActions: "", preventiveActions: "",
  });

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
  }, []);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }) });
      const res = await fetch(`/api/incidents?${q}`);
      const data = await res.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const resetForm = () => setForm({
    title: "", type: "near-miss", severity: "minor", status: "reported",
    site: "", building: "", location: "",
    dateOccurred: "", description: "", immediateActions: "",
    personsInvolved: "", witnesses: "",
    rootCause: "", correctiveActions: "", preventiveActions: "",
  });

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Title is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/incidents", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Incident updated" : "Incident reported");
        setShowModal(false); setEditing(null); resetForm(); fetchIncidents();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this incident?")) return;
    await fetch(`/api/incidents?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchIncidents();
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({
      title: inc.title, type: inc.type, severity: inc.severity, status: inc.status,
      site: inc.site?._id || "", building: inc.building?._id || "",
      location: inc.location || "",
      dateOccurred: inc.dateOccurred?.split("T")[0] || "",
      description: inc.description || "", immediateActions: inc.immediateActions || "",
      personsInvolved: inc.personsInvolved || "", witnesses: inc.witnesses || "",
      rootCause: inc.investigation?.rootCause || "",
      correctiveActions: inc.investigation?.correctiveActions || "",
      preventiveActions: inc.investigation?.preventiveActions || "",
    });
    setShowModal(true);
  };

  const getSeverityColor = (s) => {
    const map = { minor: "bg-emerald-50 text-emerald-700", moderate: "bg-amber-50 text-amber-700",
      major: "bg-orange-50 text-orange-700", critical: "bg-red-50 text-red-700", fatal: "bg-red-100 text-red-800" };
    return map[s] || "bg-gray-100 text-gray-600";
  };

  const columns = [
    { header: "Incident", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
          <AlertOctagon size={16} className="text-red-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400">{row.dateOccurred ? new Date(row.dateOccurred).toLocaleDateString() : "—"}</p>
        </div>
      </div>
    )},
    { header: "Type", render: (row) => <span className="capitalize text-gray-600 text-sm">{row.type?.replace("-", " ")}</span> },
    { header: "Severity", render: (row) => (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getSeverityColor(row.severity)}`}>
        {row.severity}
      </span>
    )},
    { header: "Site", render: (row) => <span className="text-gray-600 text-sm">{row.site?.name || "—"}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const openCount = incidents.filter(i => i.status === "reported" || i.status === "investigating").length;
  const criticalCount = incidents.filter(i => i.severity === "critical" || i.severity === "major").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Incidents"
          subtitle="Report and track safety incidents"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Safety & Compliance" }, { label: "Incidents" }]}
          actions={<Button icon={<Plus size={16} />} variant="danger" onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>Report Incident</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<AlertOctagon size={20} />} label="Total Incidents" value={incidents.length} color="blue" />
          <StatCard icon={<AlertTriangle size={20} />} label="Open" value={openCount} color="yellow" />
          <StatCard icon={<Shield size={20} />} label="Critical/Major" value={criticalCount} color="red" />
          <StatCard icon={<Calendar size={20} />} label="Resolved" value={incidents.filter(i => i.status === "resolved").length} color="green" />
        </div>

        <DataTable columns={columns} data={incidents} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search incidents..." emptyMessage="No incidents reported." />

        {/* Create / Edit Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Incident" : "Report Incident"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="danger" onClick={handleSubmit}>{editing ? "Update" : "Report"}</Button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Incident Title" required className="md:col-span-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief description" />
            </FormField>
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={INCIDENT_TYPES} />
            </FormField>
            <FormField label="Severity">
              <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} options={SEVERITIES} />
            </FormField>
            <FormField label="Site">
              <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
                placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
            </FormField>
            <FormField label="Date Occurred">
              <Input type="date" value={form.dateOccurred} onChange={(e) => setForm({ ...form, dateOccurred: e.target.value })} />
            </FormField>
            <FormField label="Location / Area">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Specific location" />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[{ value: "reported", label: "Reported" }, { value: "investigating", label: "Investigating" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }]} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description of what happened" />
            </FormField>
            <FormField label="Immediate Actions Taken" className="md:col-span-2">
              <Textarea rows={2} value={form.immediateActions} onChange={(e) => setForm({ ...form, immediateActions: e.target.value })} />
            </FormField>
            <FormField label="Root Cause" className="md:col-span-2">
              <Textarea rows={2} value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} />
            </FormField>
            <FormField label="Corrective Actions">
              <Textarea rows={2} value={form.correctiveActions} onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })} />
            </FormField>
            <FormField label="Preventive Actions">
              <Textarea rows={2} value={form.preventiveActions} onChange={(e) => setForm({ ...form, preventiveActions: e.target.value })} />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || "Incident Detail"} size="lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-sm capitalize">{showDetail.type?.replace("-", " ")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Severity</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${getSeverityColor(showDetail.severity)}`}>{showDetail.severity}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold text-sm">{showDetail.dateOccurred ? new Date(showDetail.dateOccurred).toLocaleDateString() : "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={showDetail.status} />
                </div>
              </div>
              {showDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{showDetail.description}</p>
                </div>
              )}
              {showDetail.immediateActions && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Immediate Actions</h4>
                  <p className="text-sm text-gray-600">{showDetail.immediateActions}</p>
                </div>
              )}
              {showDetail.investigation?.rootCause && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Root Cause</h4>
                  <p className="text-sm text-gray-600">{showDetail.investigation.rootCause}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
