import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  ClipboardCheck, Plus, Edit, Trash2, Eye, Building2,
  AlertTriangle, BarChart3, TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";

const CONDITION_RATINGS = [
  { value: 1, label: "1 - Critical (Immediate Replacement)" },
  { value: 2, label: "2 - Poor (Major Repair/Replace 1-2yr)" },
  { value: 3, label: "3 - Fair (Minor Repair Needed)" },
  { value: 4, label: "4 - Good (Routine Maintenance)" },
  { value: 5, label: "5 - Excellent (Like New)" },
];

const FCA_SYSTEMS = [
  "Roofing", "Exterior Walls", "Windows & Doors", "Interior Finishes",
  "HVAC", "Plumbing", "Electrical", "Fire Protection",
  "Elevators", "Site/Grounds", "Structure/Foundation",
];

export default function FCAPage() {
  const [assessments, setAssessments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    building: "", assessmentDate: "", assessor: "", status: "draft",
    currentReplacementValue: "", notes: "",
    systemRatings: FCA_SYSTEMS.map(s => ({ system: s, conditionRating: 3, notes: "", estimatedCost: 0 })),
  });

  useEffect(() => {
    fetch("/api/buildings").then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : []));
  }, []);

  const fetchFCA = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fca?${search ? `search=${search}` : ""}`);
      const data = await res.json();
      setAssessments(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchFCA(); }, [fetchFCA]);

  const resetForm = () => setForm({
    building: "", assessmentDate: "", assessor: "", status: "draft",
    currentReplacementValue: "", notes: "",
    systemRatings: FCA_SYSTEMS.map(s => ({ system: s, conditionRating: 3, notes: "", estimatedCost: 0 })),
  });

  const handleSubmit = async () => {
    if (!form.building) return toast.error("Building is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/fca", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Assessment updated" : "Assessment created");
        setShowModal(false); setEditing(null); resetForm(); fetchFCA();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assessment?")) return;
    await fetch(`/api/fca?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchFCA();
  };

  const getFCIColor = (fci) => {
    if (fci <= 0.05) return "text-emerald-600 bg-emerald-50";
    if (fci <= 0.1) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getFCILabel = (fci) => {
    if (fci <= 0.05) return "Good";
    if (fci <= 0.1) return "Fair";
    if (fci <= 0.3) return "Poor";
    return "Critical";
  };

  const formatCurrency = (v) => v ? `₦${Number(v).toLocaleString()}` : "—";

  const columns = [
    { header: "Building", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
          <ClipboardCheck size={16} className="text-teal-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.building?.name || "—"}</p>
          <p className="text-xs text-gray-400">{row.assessmentDate ? new Date(row.assessmentDate).toLocaleDateString() : "—"}</p>
        </div>
      </div>
    )},
    { header: "Assessor", render: (row) => <span className="text-gray-600">{row.assessor || "—"}</span> },
    { header: "CRV", render: (row) => <span className="font-medium text-gray-700">{formatCurrency(row.currentReplacementValue)}</span> },
    { header: "Deficiency Cost", render: (row) => <span className="text-red-600 font-medium">{formatCurrency(row.totalDeficiencyCost)}</span> },
    { header: "FCI", render: (row) => {
      const fci = row.facilityConditionIndex || 0;
      return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getFCIColor(fci)}`}>
          {(fci * 100).toFixed(1)}% — {getFCILabel(fci)}
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

  const avgFCI = assessments.length > 0
    ? assessments.reduce((s, a) => s + (a.facilityConditionIndex || 0), 0) / assessments.length
    : 0;
  const totalDeficiency = assessments.reduce((s, a) => s + (a.totalDeficiencyCost || 0), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Facility Condition Assessment"
          subtitle="Evaluate and track building conditions (FCA/FCI)"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Condition Assessment" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Assessment</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<ClipboardCheck size={20} />} label="Total Assessments" value={assessments.length} color="blue" />
          <StatCard icon={<BarChart3 size={20} />} label="Average FCI" value={`${(avgFCI * 100).toFixed(1)}%`} color={avgFCI <= 0.1 ? "green" : "red"} />
          <StatCard icon={<TrendingDown size={20} />} label="Total Deficiency" value={formatCurrency(totalDeficiency)} color="red" />
          <StatCard icon={<Building2 size={20} />} label="Buildings Assessed" value={new Set(assessments.map(a => a.building?._id)).size} color="purple" />
        </div>

        <DataTable columns={columns} data={assessments} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search assessments..." emptyMessage="No assessments found." />

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title="New FCA Assessment" size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Assessment</Button></>}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Building" required>
                <Select value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}
                  placeholder="Select building" options={buildings.map(b => ({ value: b._id, label: b.name }))} />
              </FormField>
              <FormField label="Assessment Date">
                <Input type="date" value={form.assessmentDate} onChange={(e) => setForm({ ...form, assessmentDate: e.target.value })} />
              </FormField>
              <FormField label="Assessor Name">
                <Input value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} />
              </FormField>
              <FormField label="Current Replacement Value ($)">
                <Input type="number" value={form.currentReplacementValue} onChange={(e) => setForm({ ...form, currentReplacementValue: e.target.value })} />
              </FormField>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">System Ratings</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {form.systemRatings.map((sr, i) => (
                  <div key={sr.system} className="grid grid-cols-12 gap-3 items-center bg-gray-50 rounded-lg p-3">
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-700">{sr.system}</p>
                    </div>
                    <div className="col-span-4">
                      <Select value={sr.conditionRating} onChange={(e) => {
                        const updated = [...form.systemRatings];
                        updated[i] = { ...updated[i], conditionRating: Number(e.target.value) };
                        setForm({ ...form, systemRatings: updated });
                      }} options={CONDITION_RATINGS.map(r => ({ value: r.value, label: r.label }))} />
                    </div>
                    <div className="col-span-3">
                      <Input type="number" placeholder="Est. Cost"
                        value={sr.estimatedCost} onChange={(e) => {
                          const updated = [...form.systemRatings];
                          updated[i] = { ...updated[i], estimatedCost: Number(e.target.value) };
                          setForm({ ...form, systemRatings: updated });
                        }} />
                    </div>
                    <div className="col-span-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        sr.conditionRating >= 4 ? "bg-emerald-100 text-emerald-700" :
                        sr.conditionRating === 3 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>{sr.conditionRating}</div>
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
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Assessment Details" size="xl">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Building</p>
                  <p className="font-semibold text-sm">{showDetail.building?.name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">CRV</p>
                  <p className="font-semibold text-sm">{formatCurrency(showDetail.currentReplacementValue)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Deficiency</p>
                  <p className="font-semibold text-sm text-red-600">{formatCurrency(showDetail.totalDeficiencyCost)}</p>
                </div>
                <div className={`rounded-lg p-3 ${getFCIColor(showDetail.facilityConditionIndex || 0)}`}>
                  <p className="text-xs opacity-70">FCI</p>
                  <p className="font-bold text-lg">{((showDetail.facilityConditionIndex || 0) * 100).toFixed(1)}%</p>
                  <p className="text-xs font-medium">{getFCILabel(showDetail.facilityConditionIndex || 0)}</p>
                </div>
              </div>

              {showDetail.systemRatings?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">System Ratings</h4>
                  <div className="space-y-2">
                    {showDetail.systemRatings.map((sr) => (
                      <div key={sr.system} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-sm text-gray-700">{sr.system}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-red-600">{sr.estimatedCost ? formatCurrency(sr.estimatedCost) : "—"}</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            sr.conditionRating >= 4 ? "bg-emerald-100 text-emerald-700" :
                            sr.conditionRating === 3 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>{sr.conditionRating}</div>
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
