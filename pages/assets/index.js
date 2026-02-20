import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge, PriorityBadge,
  Button, Modal, FormField, Input, Select, Textarea, Tabs,
} from "@/components/ui/SharedComponents";
import {
  Package, Plus, Edit, Trash2, QrCode, Download, Search,
  Calendar, DollarSign, Wrench, AlertTriangle, Eye,
} from "lucide-react";
import toast from "react-hot-toast";

const ASSET_CATEGORIES = [
  "HVAC", "Electrical", "Plumbing", "Fire Safety", "Elevator/Escalator",
  "Structural", "IT/Network", "Security", "Furniture", "Landscaping",
  "Cleaning Equipment", "Kitchen/Catering", "Medical", "Transport", "Other",
];

const STATUSES = [
  { value: "in-service", label: "In Service" },
  { value: "out-of-service", label: "Out of Service" },
  { value: "under-maintenance", label: "Under Maintenance" },
  { value: "disposed", label: "Disposed" },
  { value: "in-storage", label: "In Storage" },
];

const MAINTENANCE_STRATEGIES = [
  { value: "RTF", label: "Run to Failure" },
  { value: "PPM", label: "Planned Preventive" },
  { value: "PdM", label: "Predictive" },
];

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState({
    name: "", description: "", category: "HVAC", status: "in-service",
    site: "", building: "", facilitySpace: "",
    model: "", serialNumber: "", manufacturer: "", internalRefNumber: "",
    purchaseDate: "", installationDate: "", warrantyExpiryDate: "",
    usefulLifeYears: "", purchaseCost: "", replacementCost: "", salvageValue: "",
    depreciationMethod: "straight-line", maintenanceStrategy: "PPM",
  });

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (form.site) {
      fetch(`/api/buildings?siteId=${form.site}`).then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : []));
    }
  }, [form.site]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }) });
      const res = await fetch(`/api/assets?${q}`);
      const data = await res.json();
      setAssets(data.assets || (Array.isArray(data) ? data : []));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const resetForm = () => setForm({
    name: "", description: "", category: "HVAC", status: "in-service",
    site: "", building: "", facilitySpace: "",
    model: "", serialNumber: "", manufacturer: "", internalRefNumber: "",
    purchaseDate: "", installationDate: "", warrantyExpiryDate: "",
    usefulLifeYears: "", purchaseCost: "", replacementCost: "", salvageValue: "",
    depreciationMethod: "straight-line", maintenanceStrategy: "PPM",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.category) return toast.error("Name and category are required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/assets", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Asset updated" : "Asset created");
        setShowModal(false); setEditing(null); resetForm(); fetchAssets();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save asset");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await fetch(`/api/assets/${id}`, { method: "DELETE" });
      toast.success("Asset deleted"); fetchAssets();
    } catch { toast.error("Failed to delete"); }
  };

  const openEdit = (asset) => {
    setEditing(asset);
    setForm({
      name: asset.name || "", description: asset.description || "",
      category: asset.category || "HVAC", status: asset.status || "in-service",
      site: asset.site?._id || "", building: asset.building?._id || "",
      facilitySpace: asset.facilitySpace?._id || "",
      model: asset.model || "", serialNumber: asset.serialNumber || "",
      manufacturer: asset.manufacturer || "", internalRefNumber: asset.internalRefNumber || "",
      purchaseDate: asset.purchaseDate?.split("T")[0] || "",
      installationDate: asset.installationDate?.split("T")[0] || "",
      warrantyExpiryDate: asset.warrantyExpiryDate?.split("T")[0] || "",
      usefulLifeYears: asset.usefulLifeYears || "",
      purchaseCost: asset.purchaseCost || "", replacementCost: asset.replacementCost || "",
      salvageValue: asset.salvageValue || "",
      depreciationMethod: asset.depreciationMethod || "straight-line",
      maintenanceStrategy: asset.maintenanceStrategy || "PPM",
    });
    setShowModal(true);
  };

  const formatCurrency = (v) => v ? `$${Number(v).toLocaleString()}` : "—";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

  const columns = [
    { header: "Asset", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Package size={16} className="text-blue-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400">{row.assetTag || "—"}</p>
        </div>
      </div>
    )},
    { header: "Category", render: (row) => <span className="text-gray-600 text-sm">{row.category}</span> },
    { header: "Location", render: (row) => (
      <span className="text-gray-600 text-sm">{row.site?.name || row.building?.name || "—"}</span>
    )},
    { header: "Strategy", render: (row) => (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
        {row.maintenanceStrategy || "—"}
      </span>
    )},
    { header: "Value", render: (row) => <span className="text-gray-700 font-medium">{formatCurrency(row.currentValue || row.purchaseCost)}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const inService = assets.filter(a => a.status === "in-service").length;
  const nearReplacement = assets.filter(a => {
    if (!a.replacementDueDate) return false;
    const diff = (new Date(a.replacementDueDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 365 && diff > 0;
  }).length;
  const totalValue = assets.reduce((s, a) => s + (a.currentValue || a.purchaseCost || 0), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Asset Register"
          subtitle="Track and manage all facility assets"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Asset Register" }]}
          actions={
            <Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>
              Add Asset
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Package size={20} />} label="Total Assets" value={assets.length} color="blue" />
          <StatCard icon={<Wrench size={20} />} label="In Service" value={inService} color="green" />
          <StatCard icon={<AlertTriangle size={20} />} label="Near Replacement" value={nearReplacement} color="yellow" />
          <StatCard icon={<DollarSign size={20} />} label="Total Value" value={formatCurrency(totalValue)} color="purple" />
        </div>

        <DataTable
          columns={columns}
          data={assets}
          loading={loading}
          onSearch={setSearch}
          searchValue={search}
          searchPlaceholder="Search assets by name, tag, or category..."
          emptyMessage="No assets found. Add your first asset to get started."
        />

        {/* Add / Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Asset" : "Add New Asset"}
          size="xl"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editing ? "Update" : "Create"} Asset</Button>
            </>
          }
        >
          <Tabs
            tabs={[
              { id: "details", label: "Details" },
              { id: "location", label: "Location" },
              { id: "lifecycle", label: "Lifecycle & Finance" },
              { id: "maintenance", label: "Maintenance" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <div className="mt-4">
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Asset Name" required>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., AHU-01 Supply Fan" />
                </FormField>
                <FormField label="Category" required>
                  <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    options={ASSET_CATEGORIES.map(c => ({ value: c, label: c }))} />
                </FormField>
                <FormField label="Status">
                  <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
                </FormField>
                <FormField label="Manufacturer">
                  <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                </FormField>
                <FormField label="Model">
                  <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </FormField>
                <FormField label="Serial Number">
                  <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
                </FormField>
                <FormField label="Internal Ref Number">
                  <Input value={form.internalRefNumber} onChange={(e) => setForm({ ...form, internalRefNumber: e.target.value })} />
                </FormField>
                <FormField label="Description" className="md:col-span-2">
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </FormField>
              </div>
            )}
            {activeTab === "location" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Site">
                  <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value, building: "" })}
                    placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
                </FormField>
                <FormField label="Building">
                  <Select value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}
                    placeholder="Select building" options={buildings.map(b => ({ value: b._id, label: b.name }))} />
                </FormField>
              </div>
            )}
            {activeTab === "lifecycle" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Purchase Date">
                  <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
                </FormField>
                <FormField label="Installation Date">
                  <Input type="date" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} />
                </FormField>
                <FormField label="Warranty Expiry">
                  <Input type="date" value={form.warrantyExpiryDate} onChange={(e) => setForm({ ...form, warrantyExpiryDate: e.target.value })} />
                </FormField>
                <FormField label="Useful Life (years)">
                  <Input type="number" value={form.usefulLifeYears} onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })} />
                </FormField>
                <FormField label="Purchase Cost ($)">
                  <Input type="number" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} />
                </FormField>
                <FormField label="Replacement Cost ($)">
                  <Input type="number" value={form.replacementCost} onChange={(e) => setForm({ ...form, replacementCost: e.target.value })} />
                </FormField>
                <FormField label="Salvage Value ($)">
                  <Input type="number" value={form.salvageValue} onChange={(e) => setForm({ ...form, salvageValue: e.target.value })} />
                </FormField>
                <FormField label="Depreciation Method">
                  <Select value={form.depreciationMethod} onChange={(e) => setForm({ ...form, depreciationMethod: e.target.value })}
                    options={[{ value: "straight-line", label: "Straight Line" }, { value: "declining-balance", label: "Declining Balance" }, { value: "units-of-production", label: "Units of Production" }]} />
                </FormField>
              </div>
            )}
            {activeTab === "maintenance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Maintenance Strategy">
                  <Select value={form.maintenanceStrategy} onChange={(e) => setForm({ ...form, maintenanceStrategy: e.target.value })}
                    options={MAINTENANCE_STRATEGIES} />
                </FormField>
              </div>
            )}
          </div>
        </Modal>

        {/* Detail View Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name || "Asset Detail"} size="xl">
          {showDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Asset Tag</p>
                  <p className="font-semibold text-gray-900">{showDetail.assetTag || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-semibold text-gray-900">{showDetail.category}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={showDetail.status} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Strategy</p>
                  <p className="font-semibold text-gray-900">{showDetail.maintenanceStrategy}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Identity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Manufacturer</span><span className="text-gray-900">{showDetail.manufacturer || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Model</span><span className="text-gray-900">{showDetail.model || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Serial Number</span><span className="text-gray-900">{showDetail.serialNumber || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Internal Ref</span><span className="text-gray-900">{showDetail.internalRefNumber || "—"}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Purchase Cost</span><span className="text-gray-900 font-medium">{formatCurrency(showDetail.purchaseCost)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Current Value</span><span className="text-gray-900 font-medium">{formatCurrency(showDetail.currentValue)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Replacement Cost</span><span className="text-gray-900 font-medium">{formatCurrency(showDetail.replacementCost)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Purchase Date</span><span className="text-gray-900">{formatDate(showDetail.purchaseDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Warranty Expiry</span><span className="text-gray-900">{formatDate(showDetail.warrantyExpiryDate)}</span></div>
                  </div>
                </div>
              </div>

              {showDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
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
