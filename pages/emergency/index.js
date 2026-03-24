import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, FormAlert,
} from "@/components/ui/SharedComponents";
import {
  Siren, Plus, Edit, Trash2, Eye, Phone,
  Users, FileText, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { readApiError } from "@/lib/clientApi";

export default function EmergencyPage() {
  const [plans, setPlans] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    site: "", title: "", status: "draft",
    effectiveDate: "", reviewDate: "", description: "",
    contacts: [{ name: "", role: "", phone: "", email: "", organization: "", type: "internal" }],
    assemblyPoints: [{ name: "", location: "" }],
    incidentResponsePlan: "", evacuationProcedure: "",
    drillLogs: [],
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    site: "", title: "", status: "draft",
    effectiveDate: "", reviewDate: "", description: "",
    contacts: [{ name: "", role: "", phone: "", email: "", organization: "", type: "internal" }],
    assemblyPoints: [{ name: "", location: "" }],
    incidentResponsePlan: "", evacuationProcedure: "",
    drillLogs: [],
  });

  const handleSubmit = async () => {
    if (!form.title || !form.site) return toast.error("Title and site are required");
    const method = editing ? "PUT" : "POST";
    // Filter out empty contacts and assembly points before submit
    const cleanedForm = {
      ...form,
      contacts: form.contacts.filter(c => c.name?.trim()),
      assemblyPoints: form.assemblyPoints.filter(ap => ap.name?.trim()),
    };
    const payload = editing ? { ...cleanedForm, _id: editing._id } : cleanedForm;
    try {
      setSaving(true);
      setSubmitError("");
      setFieldErrors({});
      const res = await fetch("/api/emergency", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Plan updated" : "Plan created");
        setShowModal(false); setEditing(null); resetForm(); fetchPlans();
      } else {
        const err = await readApiError(res, "Failed to save emergency plan");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong while saving this emergency plan.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/emergency?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchPlans();
  };

  const addContact = () => {
    setForm({ ...form, contacts: [...form.contacts, { name: "", role: "", phone: "", email: "", organization: "", type: "internal" }] });
  };

  const updateContact = (index, field, value) => {
    const updated = [...form.contacts];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, contacts: updated });
  };

  const removeContact = (index) => {
    setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== index) });
  };

  const addAssemblyPoint = () => {
    setForm({ ...form, assemblyPoints: [...form.assemblyPoints, { name: "", location: "" }] });
  };

  const updateAssemblyPoint = (index, field, value) => {
    const updated = [...form.assemblyPoints];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, assemblyPoints: updated });
  };

  const removeAssemblyPoint = (index) => {
    setForm({ ...form, assemblyPoints: form.assemblyPoints.filter((_, i) => i !== index) });
  };

  const addDrillLog = () => {
    setForm({ ...form, drillLogs: [...form.drillLogs, { drillType: "", date: "", participants: 0, duration: 0, scenario: "", observations: "", improvements: "", conductedBy: "", passed: true }] });
  };

  const updateDrillLog = (index, field, value) => {
    const updated = [...form.drillLogs];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, drillLogs: updated });
  };

  const removeDrillLog = (index) => {
    setForm({ ...form, drillLogs: form.drillLogs.filter((_, i) => i !== index) });
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      site: plan.site?._id || "", title: plan.title || "", status: plan.status || "draft",
      effectiveDate: plan.effectiveDate?.split("T")[0] || plan.createdAt?.split("T")[0] || "",
      reviewDate: plan.reviewDate?.split("T")[0] || "", description: plan.description || "",
      contacts: plan.contacts?.length ? plan.contacts.map(c => ({ name: c.name || "", role: c.role || "", phone: c.phone || "", email: c.email || "", organization: c.organization || "", type: c.type || "internal" })) : [{ name: "", role: "", phone: "", email: "", organization: "", type: "internal" }],
      assemblyPoints: plan.assemblyPoints?.length ? plan.assemblyPoints : [{ name: "", location: "" }],
      incidentResponsePlan: plan.incidentResponsePlan || "", evacuationProcedure: plan.evacuationProcedure || "",
      drillLogs: plan.drillLogs?.length ? plan.drillLogs.map(d => ({ drillType: d.drillType || "", date: d.date?.split("T")[0] || "", participants: d.participants || 0, duration: d.duration || 0, scenario: d.scenario || "", observations: d.observations || "", improvements: d.improvements || "", conductedBy: d.conductedBy || "", passed: d.passed !== false })) : [],
    });
    setShowModal(true);
  };

  const columns = [
    { header: "Plan", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
          <Siren size={16} className="text-red-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400">{row.status}</p>
        </div>
      </div>
    )},
    { header: "Site", render: (row) => <span className="text-gray-600">{row.site?.name || "—"}</span> },
    { header: "Contacts", render: (row) => <span className="text-gray-600">{row.contacts?.length || 0}</span> },
    { header: "Drills", render: (row) => <span className="text-gray-600">{row.drillLogs?.length || 0}</span> },
    { header: "Review Date", render: (row) => (
      <span className={`text-sm ${row.reviewDate && new Date(row.reviewDate) < new Date() ? "text-red-600 font-medium" : "text-gray-600"}`}>
        {row.reviewDate ? new Date(row.reviewDate).toLocaleDateString() : "—"}
      </span>
    )},
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
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
          <StatCard icon={<Users size={20} />} label="Total Contacts" value={plans.reduce((s, p) => s + (p.contacts?.length || 0), 0)} color="purple" />
        </div>

        <DataTable columns={columns} data={plans} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search plans..." emptyMessage="No emergency plans found." />

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Plan" : "New Emergency Plan"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : (editing ? "Update" : "Create")}</Button></>}
        >
          <FormAlert message={submitError} />
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Plan Title" required className="md:col-span-2" error={fieldErrors.title}>
                <Input aria-invalid={!!fieldErrors.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Fire Emergency Response Plan" />
              </FormField>
              <FormField label="Site" required error={fieldErrors.site}>
                <Select aria-invalid={!!fieldErrors.site} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
                  placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "under-review", label: "Under Review" }, { value: "archived", label: "Archived" }]} />
              </FormField>
              <FormField label="Effective Date">
                <Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
              </FormField>
              <FormField label="Review Date">
                <Input type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
              </FormField>
            </div>

            <FormField label="Incident Response Plan">
              <Textarea rows={3} value={form.incidentResponsePlan} onChange={(e) => setForm({ ...form, incidentResponsePlan: e.target.value })} placeholder="Describe the incident response procedures..." />
            </FormField>

            <FormField label="Evacuation Procedure">
              <Textarea rows={3} value={form.evacuationProcedure} onChange={(e) => setForm({ ...form, evacuationProcedure: e.target.value })} placeholder="Describe evacuation procedures..." />
            </FormField>

            {/* Assembly Points */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Assembly Points</h4>
                <Button variant="ghost" size="xs" icon={<Plus size={14} />} onClick={addAssemblyPoint}>Add Point</Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {form.assemblyPoints.map((point, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 bg-gray-50 rounded-lg p-3 items-center">
                    <div className="col-span-5"><Input placeholder="Name (e.g., Assembly Point A)" value={point.name} onChange={(e) => updateAssemblyPoint(i, "name", e.target.value)} /></div>
                    <div className="col-span-5"><Input placeholder="Location (e.g., Parking Lot A)" value={point.location} onChange={(e) => updateAssemblyPoint(i, "location", e.target.value)} /></div>
                    <div className="col-span-2 text-center">
                      {form.assemblyPoints.length > 1 && (
                        <button onClick={() => removeAssemblyPoint(i)} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Emergency Contacts</h4>
                <Button variant="ghost" size="xs" icon={<Plus size={14} />} onClick={addContact}>Add Contact</Button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {form.contacts.map((contact, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 bg-gray-50 rounded-lg p-3 items-center">
                    <div className="col-span-2"><Input placeholder="Name" value={contact.name} onChange={(e) => updateContact(i, "name", e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Role" value={contact.role} onChange={(e) => updateContact(i, "role", e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Organization" value={contact.organization} onChange={(e) => updateContact(i, "organization", e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Phone" value={contact.phone} onChange={(e) => updateContact(i, "phone", e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Email" value={contact.email} onChange={(e) => updateContact(i, "email", e.target.value)} /></div>
                    <div className="col-span-1">
                      <Select value={contact.type} onChange={(e) => updateContact(i, "type", e.target.value)}
                        options={[{ value: "internal", label: "Int" }, { value: "external", label: "Ext" }]} />
                    </div>
                    <div className="col-span-1 text-center">
                      {form.contacts.length > 1 && (
                        <button onClick={() => removeContact(i)} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField label="Description / Additional Notes">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Additional notes and procedures..." />
            </FormField>

            {/* Drill Logs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Drill Logs</h4>
                <Button variant="ghost" size="xs" icon={<Plus size={14} />} onClick={addDrillLog}>Add Drill</Button>
              </div>
              {form.drillLogs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No drill logs added yet.</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {form.drillLogs.map((drill, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3"><Input placeholder="Drill Type (e.g., Fire)" value={drill.drillType} onChange={(e) => updateDrillLog(i, "drillType", e.target.value)} /></div>
                        <div className="col-span-2"><Input type="date" value={drill.date} onChange={(e) => updateDrillLog(i, "date", e.target.value)} /></div>
                        <div className="col-span-2"><Input type="number" placeholder="Participants" value={drill.participants || ""} onChange={(e) => updateDrillLog(i, "participants", Number(e.target.value))} /></div>
                        <div className="col-span-2"><Input type="number" placeholder="Duration (min)" value={drill.duration || ""} onChange={(e) => updateDrillLog(i, "duration", Number(e.target.value))} /></div>
                        <div className="col-span-2"><Input placeholder="Conducted By" value={drill.conductedBy} onChange={(e) => updateDrillLog(i, "conductedBy", e.target.value)} /></div>
                        <div className="col-span-1 text-center">
                          <button onClick={() => removeDrillLog(i)} className="p-1 rounded hover:bg-red-100"><Trash2 size={14} className="text-red-400" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Scenario" value={drill.scenario} onChange={(e) => updateDrillLog(i, "scenario", e.target.value)} />
                        <Input placeholder="Observations" value={drill.observations} onChange={(e) => updateDrillLog(i, "observations", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || "Plan Detail"} size="lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="font-semibold text-sm">{showDetail.title}</p>
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

              {showDetail.contacts?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Emergency Contacts</h4>
                  <div className="space-y-2">
                    {showDetail.contacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.role}{c.organization ? ` • ${c.organization}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {c.phone && <span className="text-sm text-gray-600 flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.assemblyPoints?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Assembly Points</h4>
                  <div className="space-y-1">
                    {showDetail.assemblyPoints.map((ap, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-700">
                        <span className="font-medium">{ap.name}</span>{ap.location ? ` — ${ap.location}` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.incidentResponsePlan && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Incident Response Plan</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{showDetail.incidentResponsePlan}</p>
                </div>
              )}

              {showDetail.evacuationProcedure && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Evacuation Procedure</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{showDetail.evacuationProcedure}</p>
                </div>
              )}

              {showDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Additional Notes</h4>
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
