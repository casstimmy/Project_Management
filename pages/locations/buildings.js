import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import { Building2, Plus, Edit, Trash2, Layers } from "lucide-react";
import toast from "react-hot-toast";

export default function BuildingsPage() {
  const router = useRouter();
  const { siteId } = router.query;
  const [buildings, setBuildings] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    siteId: "", name: "", code: "", type: "office", floors: 1,
    totalArea: "", yearBuilt: "", description: "", status: "operational",
  });

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
  }, []);

  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(siteId && { siteId }), ...(search && { search }) });
      const res = await fetch(`/api/buildings?${q}`);
      const data = await res.json();
      setBuildings(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, siteId]);

  useEffect(() => { fetchBuildings(); }, [fetchBuildings]);

  const handleSubmit = async () => {
    if (!form.name || !form.siteId) return toast.error("Name and site are required");
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, _id: editing._id } : form;
    const res = await fetch("/api/buildings", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editing ? "Updated" : "Created");
      setShowModal(false); setEditing(null); fetchBuildings();
    } else { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete building?")) return;
    await fetch(`/api/buildings?id=${id}`, { method: "DELETE" });
    toast.success("Deleted"); fetchBuildings();
  };

  const columns = [
    { header: "Building", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Building2 size={16} className="text-indigo-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400">{row.code || "—"}</p>
        </div>
      </div>
    )},
    { header: "Site", render: (row) => <span className="text-gray-600">{row.site?.name || "—"}</span> },
    { header: "Type", render: (row) => <span className="capitalize text-gray-600">{row.type}</span> },
    { header: "Floors", accessor: "floors" },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setEditing(row); setForm({ siteId: row.site?._id || "", name: row.name, code: row.code || "", type: row.type, floors: row.floors, totalArea: row.totalArea || "", yearBuilt: row.yearBuilt || "", description: row.description || "", status: row.status }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Buildings"
          subtitle="Manage buildings across your facility sites"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Locations" }, { label: "Buildings" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setForm({ siteId: siteId || "", name: "", code: "", type: "office", floors: 1, totalArea: "", yearBuilt: "", description: "", status: "operational" }); setShowModal(true); }}>Add Building</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Building2 size={20} />} label="Total Buildings" value={buildings.length} color="indigo" />
          <StatCard icon={<Layers size={20} />} label="Operational" value={buildings.filter(b => b.status === "operational").length} color="green" />
          <StatCard icon={<Building2 size={20} />} label="Under Maintenance" value={buildings.filter(b => b.status === "under-maintenance").length} color="yellow" />
        </div>

        <DataTable columns={columns} data={buildings} loading={loading} onSearch={setSearch} searchValue={search} searchPlaceholder="Search buildings..." />

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Building" : "Add Building"} size="lg"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Site" required>
              <Select value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })} placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
            </FormField>
            <FormField label="Building Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Main Office Block" />
            </FormField>
            <FormField label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></FormField>
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[
                { value: "office", label: "Office" }, { value: "warehouse", label: "Warehouse" },
                { value: "residential", label: "Residential" }, { value: "commercial", label: "Commercial" },
                { value: "industrial", label: "Industrial" }, { value: "mixed-use", label: "Mixed Use" },
              ]} />
            </FormField>
            <FormField label="Floors"><Input type="number" value={form.floors} onChange={(e) => setForm({ ...form, floors: e.target.value })} /></FormField>
            <FormField label="Year Built"><Input type="number" value={form.yearBuilt} onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })} /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
                { value: "operational", label: "Operational" }, { value: "under-maintenance", label: "Under Maintenance" },
                { value: "under-construction", label: "Under Construction" }, { value: "decommissioned", label: "Decommissioned" },
              ]} />
            </FormField>
            <FormField label="Total Area (sq m)"><Input type="number" value={form.totalArea} onChange={(e) => setForm({ ...form, totalArea: e.target.value })} /></FormField>
            <FormField label="Description" className="md:col-span-2"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
