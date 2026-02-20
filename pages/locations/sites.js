import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge,
  Button, Modal, FormField, Input, Select, Textarea, EmptyState,
} from "@/components/ui/SharedComponents";
import {
  MapPin, Plus, Building2, Phone, Mail,
  Globe, Edit, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingSite, setEditingSite] = useState(null);
  const [form, setForm] = useState({
    name: "", code: "", description: "", status: "active",
    contactPerson: "", contactPhone: "", contactEmail: "", totalArea: "",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
  });

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sites?search=${search}`);
      const data = await res.json();
      setSites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  const handleSubmit = async () => {
    if (!form.name) return toast.error("Site name is required");
    try {
      const method = editingSite ? "PUT" : "POST";
      const body = editingSite ? { ...form, _id: editingSite._id } : form;
      const res = await fetch("/api/sites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingSite ? "Site updated" : "Site created");
        setShowModal(false);
        setEditingSite(null);
        resetForm();
        fetchSites();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this site?")) return;
    try {
      await fetch(`/api/sites?id=${id}`, { method: "DELETE" });
      toast.success("Site deleted");
      fetchSites();
    } catch { toast.error("Failed to delete"); }
  };

  const resetForm = () => {
    setForm({
      name: "", code: "", description: "", status: "active",
      contactPerson: "", contactPhone: "", contactEmail: "", totalArea: "",
      address: { street: "", city: "", state: "", country: "", postalCode: "" },
    });
  };

  const openEdit = (site) => {
    setEditingSite(site);
    setForm({
      name: site.name, code: site.code || "", description: site.description || "",
      status: site.status, contactPerson: site.contactPerson || "",
      contactPhone: site.contactPhone || "", contactEmail: site.contactEmail || "",
      totalArea: site.totalArea || "",
      address: site.address || { street: "", city: "", state: "", country: "", postalCode: "" },
    });
    setShowModal(true);
  };

  const columns = [
    { header: "Site Name", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <MapPin size={16} className="text-blue-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400">{row.code || "—"}</p>
        </div>
      </div>
    )},
    { header: "Location", render: (row) => (
      <span className="text-gray-600">{row.address?.city ? `${row.address.city}, ${row.address.country || ""}` : "—"}</span>
    )},
    { header: "Buildings", render: (row) => (
      <span className="text-gray-600">{row.buildings?.length || 0}</span>
    )},
    { header: "Contact", render: (row) => (
      <span className="text-gray-600 text-sm">{row.contactPerson || "—"}</span>
    )},
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Sites"
          subtitle="Manage facility sites and locations"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Sites" }]}
          actions={
            <Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditingSite(null); setShowModal(true); }}>
              Add Site
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={<MapPin size={20} />} label="Total Sites" value={sites.length} color="blue" />
          <StatCard icon={<Building2 size={20} />} label="Active Sites" value={sites.filter(s => s.status === "active").length} color="green" />
          <StatCard icon={<MapPin size={20} />} label="Under Construction" value={sites.filter(s => s.status === "under-construction").length} color="yellow" />
        </div>

        <DataTable
          columns={columns}
          data={sites}
          loading={loading}
          onSearch={setSearch}
          searchValue={search}
          searchPlaceholder="Search sites..."
          emptyMessage="No sites found. Add your first site to get started."
          onRowClick={(row) => router.push(`/locations/buildings?siteId=${row._id}`)}
        />

        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingSite(null); }}
          title={editingSite ? "Edit Site" : "Add New Site"}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingSite ? "Update" : "Create"} Site</Button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Site Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Head Office Complex" />
            </FormField>
            <FormField label="Site Code">
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., HQ-001" />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "under-construction", label: "Under Construction" },
                { value: "decommissioned", label: "Decommissioned" },
              ]} />
            </FormField>
            <FormField label="Total Area (sq m)">
              <Input type="number" value={form.totalArea} onChange={(e) => setForm({ ...form, totalArea: e.target.value })} />
            </FormField>
            <FormField label="Contact Person">
              <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            </FormField>
            <FormField label="Contact Phone">
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </FormField>
            <FormField label="Contact Email">
              <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </FormField>
            <FormField label="City">
              <Input value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
            </FormField>
            <FormField label="State">
              <Input value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
            </FormField>
            <FormField label="Country">
              <Input value={form.address.country} onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
