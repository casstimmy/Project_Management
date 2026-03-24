import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, FormAlert,
} from "@/components/ui/SharedComponents";
import { Layers, Plus, Edit, Trash2, Eye, Building2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { readApiError } from "@/lib/clientApi";

const SPACE_TYPES = [
  { value: "office", label: "Office" }, { value: "meeting-room", label: "Meeting Room" },
  { value: "server-room", label: "Server Room" }, { value: "restroom", label: "Restroom" },
  { value: "kitchen", label: "Kitchen" }, { value: "lobby", label: "Lobby" },
  { value: "corridor", label: "Corridor" }, { value: "storage", label: "Storage" },
  { value: "parking", label: "Parking" }, { value: "mechanical", label: "Mechanical" },
  { value: "electrical", label: "Electrical" }, { value: "workshop", label: "Workshop" },
  { value: "laboratory", label: "Laboratory" }, { value: "common-area", label: "Common Area" },
  { value: "other", label: "Other" },
];

const STATUSES = [
  { value: "in-use", label: "In Use" }, { value: "vacant", label: "Vacant" },
  { value: "under-maintenance", label: "Under Maintenance" }, { value: "reserved", label: "Reserved" },
];

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", building: "", code: "", floor: 0, type: "office",
    area: "", capacity: "", status: "in-use", description: "",
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetch("/api/buildings").then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }) });
      const res = await fetch(`/api/facility-spaces?${q}`);
      const data = await res.json();
      setSpaces(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const resetForm = () => setForm({
    name: "", building: "", code: "", floor: 0, type: "office",
    area: "", capacity: "", status: "in-use", description: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.building) return toast.error("Name and building are required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      setSaving(true);
      setSubmitError("");
      setFieldErrors({});
      const res = await fetch("/api/facility-spaces", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Space updated" : "Space created");
        setShowModal(false); setEditing(null); resetForm(); fetchSpaces();
      } else {
        const err = await readApiError(res, "Failed to save space");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong while saving this space.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this space?")) return;
    await fetch(`/api/facility-spaces?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchSpaces();
  };

  const openEdit = (space) => {
    setEditing(space);
    setForm({
      name: space.name || "", building: space.building?._id || "",
      code: space.code || "", floor: space.floor || 0,
      type: space.type || "office", area: space.area || "",
      capacity: space.capacity || "", status: space.status || "in-use",
      description: space.description || "",
    });
    setShowModal(true);
  };

  const columns = [
    { header: "Space", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Layers size={16} className="text-indigo-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400">{row.code || "—"} • Floor {row.floor}</p>
        </div>
      </div>
    )},
    { header: "Building", render: (row) => <span className="text-gray-600 text-sm">{row.building?.name || "—"}</span> },
    { header: "Type", render: (row) => <span className="capitalize text-gray-600 text-sm">{row.type?.replace("-", " ")}</span> },
    { header: "Area", render: (row) => <span className="text-gray-600 text-sm">{row.area ? `${row.area} m²` : "—"}</span> },
    { header: "Capacity", render: (row) => <span className="text-gray-600 text-sm">{row.capacity || "—"}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const inUseCount = spaces.filter(s => s.status === "in-use").length;
  const vacantCount = spaces.filter(s => s.status === "vacant").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Spaces"
          subtitle="Manage rooms and spaces within buildings"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Locations" }, { label: "Spaces" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>Add Space</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Layers size={20} />} label="Total Spaces" value={spaces.length} color="blue" />
          <StatCard icon={<MapPin size={20} />} label="In Use" value={inUseCount} color="green" />
          <StatCard icon={<Building2 size={20} />} label="Vacant" value={vacantCount} color="yellow" />
          <StatCard icon={<Layers size={20} />} label="Buildings" value={new Set(spaces.map(s => s.building?._id)).size} color="purple" />
        </div>

        <DataTable columns={columns} data={spaces} loading={loading} onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search spaces..." emptyMessage="No spaces found. Add your first space." />

        {/* Create / Edit Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Space" : "Add New Space"} size="lg"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : (editing ? "Update" : "Create")}</Button></>}
        >
          <FormAlert message={submitError} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Space Name" required className="md:col-span-2" error={fieldErrors.name}>
              <Input aria-invalid={!!fieldErrors.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Conference Room A" />
            </FormField>
            <FormField label="Building" required error={fieldErrors.building}>
              <Select aria-invalid={!!fieldErrors.building} value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}
                placeholder="Select building" options={buildings.map(b => ({ value: b._id, label: b.name }))} />
            </FormField>
            <FormField label="Space Code">
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., B1-F2-R101" />
            </FormField>
            <FormField label="Floor">
              <Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} />
            </FormField>
            <FormField label="Space Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={SPACE_TYPES} />
            </FormField>
            <FormField label="Area (m²)">
              <Input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g., 50" />
            </FormField>
            <FormField label="Capacity (persons)">
              <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g., 20" />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Additional details about this space" />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name || "Space Detail"} size="lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Building</p>
                  <p className="font-semibold text-sm">{showDetail.building?.name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Floor</p>
                  <p className="font-semibold text-sm">{showDetail.floor}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-sm capitalize">{showDetail.type?.replace("-", " ")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={showDetail.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Code</p>
                  <p className="font-semibold text-sm">{showDetail.code || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="font-semibold text-sm">{showDetail.area ? `${showDetail.area} m²` : "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="font-semibold text-sm">{showDetail.capacity ? `${showDetail.capacity} persons` : "—"}</p>
                </div>
              </div>
              {showDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{showDetail.description}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
