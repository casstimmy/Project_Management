import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  Siren, Plus, Edit, Trash2, Eye, Phone,
  Users, FileText, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

export default function EmergencyPage() {
  const [plans, setPlans] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    site: "", title: "", planType: "fire", status: "draft",
    effectiveDate: "", reviewDate: "", description: "",
    emergencyContacts: [{ name: "", role: "", phone: "", email: "" }],
    assemblyPoints: "",
    drills: [],
  });

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/emergency?${search ? `search=${search}` : ""}`);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const resetForm = () => setForm({
    site: "", title: "", planType: "fire", status: "draft",
    effectiveDate: "", reviewDate: "", description: "",
    emergencyContacts: [{ name: "", role: "", phone: "", email: "" }],
    assemblyPoints: "",
    drills: [],
  });

  const handleSubmit = async () => {
    if (!form.title || !form.site) return toast.error("Title and site are required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/emergency", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Plan updated" : "Plan created");
        setShowModal(false); setEditing(null); resetForm(); fetchPlans();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/emergency?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchPlans();
  };

  const addContact = () => {
    setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: "", role: "", phone: "", email: "" }] });
  };

  const updateContact = (index, field, value) => {
    const updated = [...form.emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, emergencyContacts: updated });
  };

  const removeContact = (index) => {
    setForm({ ...form, emergencyContacts: form.emergencyContacts.filter((_, i) => i !== index) });
  };

  const columns = [
    { header: "Plan", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
          <Siren size={16} className="text-red-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400 capitalize">{row.planType}</p>
        </div>
      </div>
    )},
    { header: "Site", render: (row) => <span className="text-gray-600">{row.site?.name || "—"}</span> },
    { header: "Contacts", render: (row) => <span className="text-gray-600">{row.emergencyContacts?.length || 0}</span> },
    { header: "Drills", render: (row) => <span className="text-gray-600">{row.drills?.length || 0}</span> },
    { header: "Review Date", render: (row) => (
      <span className={`text-sm ${row.reviewDate && new Date(row.reviewDate) < new Date() ? "text-red-600 font-medium" : "text-gray-600"}`}>
        {row.reviewDate ? new Date(row.reviewDate).toLocaleDateString() : "—"}
      </span>
    )},
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const activeCount = plans.filter(p => p.status === "active" || p.status === "approved").length;
  const overdueReview = plans.filter(p => p.reviewDate && new Date(p.reviewDate) < new Date()).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Emergency Plans"
          subtitle="Emergency preparedness and response planning"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Safety & Compliance" }, { label: "Emergency Plans" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Plan</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Siren size={20} />} label="Total Plans" value={plans.length} color="blue" />
          <StatCard icon={<FileText size={20} />} label="Active" value={activeCount} color="green" />
          <StatCard icon={<Calendar size={20} />} label="Due for Review" value={overdueReview} color="yellow" />
          <StatCard icon={<Users size={20} />} label="Total Contacts" value={plans.reduce((s, p) => s + (p.emergencyContacts?.length || 0), 0)} color="purple" />
        </div>

        <DataTable columns={columns} data={plans} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search plans..." emptyMessage="No emergency plans found." />

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Plan" : "New Emergency Plan"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button></>}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Plan Title" required className="md:col-span-2">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Fire Emergency Response Plan" />
              </FormField>
              <FormField label="Site" required>
                <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
                  placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
              </FormField>
              <FormField label="Plan Type">
                <Select value={form.planType} onChange={(e) => setForm({ ...form, planType: e.target.value })}
                  options={[
                    { value: "fire", label: "Fire" }, { value: "earthquake", label: "Earthquake" },
                    { value: "flood", label: "Flood" }, { value: "chemical-spill", label: "Chemical Spill" },
                    { value: "medical", label: "Medical Emergency" }, { value: "security", label: "Security Threat" },
                    { value: "pandemic", label: "Pandemic" }, { value: "general", label: "General" },
                  ]} />
              </FormField>
              <FormField label="Effective Date">
                <Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
              </FormField>
              <FormField label="Review Date">
                <Input type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "approved", label: "Approved" }, { value: "under-review", label: "Under Review" }]} />
              </FormField>
              <FormField label="Assembly Points">
                <Input value={form.assemblyPoints} onChange={(e) => setForm({ ...form, assemblyPoints: e.target.value })} placeholder="e.g., Parking Lot A, Main Gate" />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Emergency Contacts</h4>
                <Button variant="ghost" size="xs" icon={<Plus size={14} />} onClick={addContact}>Add Contact</Button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {form.emergencyContacts.map((contact, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 bg-gray-50 rounded-lg p-3 items-center">
                    <div className="col-span-3"><Input placeholder="Name" value={contact.name} onChange={(e) => updateContact(i, "name", e.target.value)} /></div>
                    <div className="col-span-3"><Input placeholder="Role" value={contact.role} onChange={(e) => updateContact(i, "role", e.target.value)} /></div>
                    <div className="col-span-3"><Input placeholder="Phone" value={contact.phone} onChange={(e) => updateContact(i, "phone", e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Email" value={contact.email} onChange={(e) => updateContact(i, "email", e.target.value)} /></div>
                    <div className="col-span-1 text-center">
                      {form.emergencyContacts.length > 1 && (
                        <button onClick={() => removeContact(i)} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField label="Description">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Emergency response procedures..." />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || "Plan Detail"} size="lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-sm capitalize">{showDetail.planType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Site</p>
                  <p className="font-semibold text-sm">{showDetail.site?.name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={showDetail.status} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Review Date</p>
                  <p className="font-semibold text-sm">{showDetail.reviewDate ? new Date(showDetail.reviewDate).toLocaleDateString() : "—"}</p>
                </div>
              </div>

              {showDetail.emergencyContacts?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Emergency Contacts</h4>
                  <div className="space-y-2">
                    {showDetail.emergencyContacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.role}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {c.phone && <span className="text-sm text-gray-600 flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Procedures</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{showDetail.description}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
