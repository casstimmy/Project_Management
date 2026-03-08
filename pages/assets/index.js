import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge, PriorityBadge,
  Button, Modal, FormField, Input, Select, Textarea, Tabs, FormAlert,
} from "@/components/ui/SharedComponents";
import {
  Package, Plus, Edit, Trash2, QrCode, Download, Search,
  Calendar, DollarSign, Wrench, AlertTriangle, Eye, Upload, X, ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { readApiError, toOptionalDate, toOptionalNumber, toOptionalObjectId } from "@/lib/clientApi";
import { ASSET_CATEGORIES, MAINTENANCE_STRATEGIES } from "@/lib/constants";

const STATUSES = [
  { value: "in-service", label: "In Service" },
  { value: "out-of-service", label: "Out of Service" },
  { value: "pending-installation", label: "Pending Installation" },
  { value: "disposed", label: "Disposed" },
];

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [facilitySpaces, setFacilitySpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    name: "", description: "", category: "HVAC", status: "in-service",
    site: "", building: "", facilitySpace: "",
    model: "", serialNumber: "", manufacturer: "", internalRefNumber: "",
    purchaseDate: "", installationDate: "", warrantyDate: "",
    usefulLife: "", purchaseCost: "", replacementCost: "", salvageValue: "",
    depreciationMethod: "straight-line", maintenanceStrategy: "PPM",
    imageUrl: "",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        const url = data.links?.[0];
        if (url) {
          updateField("imageUrl", url);
          toast.success("Image uploaded");
        }
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (form.site) {
      fetch(`/api/buildings?siteId=${form.site}`).then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : []));
    } else {
      setBuildings([]);
    }
  }, [form.site]);

  useEffect(() => {
    if (form.building) {
      fetch(`/api/facility-spaces?buildingId=${form.building}`).then(r => r.json()).then(d => setFacilitySpaces(Array.isArray(d) ? d : []));
    } else {
      setFacilitySpaces([]);
    }
  }, [form.building]);

  useEffect(() => {
    if (!showModal) {
      setSubmitError("");
      setFieldErrors({});
    }
  }, [showModal]);

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
    purchaseDate: "", installationDate: "", warrantyDate: "",
    usefulLife: "", purchaseCost: "", replacementCost: "", salvageValue: "",
    depreciationMethod: "straight-line", maintenanceStrategy: "PPM",
    imageUrl: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const payloadFromForm = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    status: form.status,
    site: toOptionalObjectId(form.site),
    building: toOptionalObjectId(form.building),
    facilitySpace: toOptionalObjectId(form.facilitySpace),
    model: form.model.trim(),
    serialNumber: form.serialNumber.trim(),
    manufacturer: form.manufacturer.trim(),
    internalRefNumber: form.internalRefNumber.trim(),
    purchaseDate: toOptionalDate(form.purchaseDate),
    installationDate: toOptionalDate(form.installationDate),
    warrantyDate: toOptionalDate(form.warrantyDate),
    usefulLife: toOptionalNumber(form.usefulLife),
    purchaseCost: toOptionalNumber(form.purchaseCost),
    replacementCost: toOptionalNumber(form.replacementCost),
    salvageValue: toOptionalNumber(form.salvageValue),
    depreciationMethod: form.depreciationMethod,
    maintenanceStrategy: form.maintenanceStrategy,
    imageUrl: form.imageUrl || undefined,
  });

  const handleSubmit = async () => {
    if (!form.name || !form.category) return toast.error("Name and category are required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...payloadFromForm(), _id: editing._id } : payloadFromForm();
    try {
      setSaving(true);
      setSubmitError("");
      setFieldErrors({});
      const res = await fetch("/api/assets", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Asset updated" : "Asset created");
        setShowModal(false); setEditing(null); resetForm(); fetchAssets();
      } else {
        const err = await readApiError(res, "Failed to save asset");
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        toast.error(err.message);
      }
    } catch {
      setSubmitError("Something went wrong while saving this asset.");
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
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
      warrantyDate: asset.warrantyDate?.split("T")[0] || "",
      usefulLife: asset.usefulLife || "",
      purchaseCost: asset.purchaseCost || "", replacementCost: asset.replacementCost || "",
      salvageValue: asset.salvageValue || "",
      depreciationMethod: asset.depreciationMethod || "straight-line",
      maintenanceStrategy: asset.maintenanceStrategy || "PPM",
      imageUrl: asset.imageUrl || "",
    });
    setSubmitError("");
    setFieldErrors({});
    setShowModal(true);
  };

  const formatCurrency = (v) => v ? `₦${Number(v).toLocaleString()}` : "—";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

  const columns = [
    { header: "Image", render: (row) => (
      row.imageUrl ? (
        <button onClick={(e) => { e.stopPropagation(); setShowImageModal({ url: row.imageUrl, name: row.name }); }}
          className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition cursor-pointer">
          <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
        </button>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <ImageIcon size={16} className="text-gray-300" />
        </div>
      )
    )},
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
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : `${editing ? "Update" : "Create"} Asset`}</Button>
            </>
          }
        >
          <FormAlert message={submitError} />
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
                <FormField label="Asset Name" required error={fieldErrors.name}>
                  <Input aria-invalid={!!fieldErrors.name} value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g., AHU-01 Supply Fan" />
                </FormField>
                <FormField label="Category" required error={fieldErrors.category}>
                  <Select aria-invalid={!!fieldErrors.category} value={form.category} onChange={(e) => updateField("category", e.target.value)}
                    options={ASSET_CATEGORIES.map(c => ({ value: c, label: c }))} />
                </FormField>
                <FormField label="Status" error={fieldErrors.status}>
                  <Select aria-invalid={!!fieldErrors.status} value={form.status} onChange={(e) => updateField("status", e.target.value)} options={STATUSES} />
                </FormField>
                <FormField label="Manufacturer">
                  <Input value={form.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
                </FormField>
                <FormField label="Model">
                  <Input value={form.model} onChange={(e) => updateField("model", e.target.value)} />
                </FormField>
                <FormField label="Serial Number">
                  <Input value={form.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
                </FormField>
                <FormField label="Internal Ref Number">
                  <Input value={form.internalRefNumber} onChange={(e) => updateField("internalRefNumber", e.target.value)} />
                </FormField>
                <FormField label="Description" className="md:col-span-2">
                  <Textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} />
                </FormField>
                <FormField label="Asset Image" className="md:col-span-2">
                  <div className="flex items-center gap-4">
                    {form.imageUrl ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={form.imageUrl} alt="Asset" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => updateField("imageUrl", "")}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <ImageIcon size={24} className="text-gray-300" />
                      </div>
                    )}
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload size={16} />
                      {uploading ? "Uploading..." : "Upload Image"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </FormField>
              </div>
            )}
            {activeTab === "location" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Site" error={fieldErrors.site}>
                  <Select aria-invalid={!!fieldErrors.site} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value, building: "", facilitySpace: "" })}
                    placeholder="Select site" options={sites.map(s => ({ value: s._id, label: s.name }))} />
                </FormField>
                <FormField label="Building" error={fieldErrors.building}>
                  <Select aria-invalid={!!fieldErrors.building} value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value, facilitySpace: "" })}
                    placeholder="Select building" options={buildings.map(b => ({ value: b._id, label: b.name }))} />
                </FormField>
                <FormField label="Space" className="md:col-span-2" error={fieldErrors.facilitySpace}>
                  <Select aria-invalid={!!fieldErrors.facilitySpace} value={form.facilitySpace} onChange={(e) => updateField("facilitySpace", e.target.value)}
                    placeholder="Select space (optional)" options={facilitySpaces.map((space) => ({ value: space._id, label: `${space.name}${space.floor !== undefined ? ` - Floor ${space.floor}` : ""}` }))} />
                </FormField>
              </div>
            )}
            {activeTab === "lifecycle" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Purchase Date">
                  <Input type="date" value={form.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} />
                </FormField>
                <FormField label="Installation Date">
                  <Input type="date" value={form.installationDate} onChange={(e) => updateField("installationDate", e.target.value)} />
                </FormField>
                <FormField label="Warranty Expiry" error={fieldErrors.warrantyDate}>
                  <Input aria-invalid={!!fieldErrors.warrantyDate} type="date" value={form.warrantyDate} onChange={(e) => updateField("warrantyDate", e.target.value)} />
                </FormField>
                <FormField label="Useful Life (years)" error={fieldErrors.usefulLife}>
                  <Input aria-invalid={!!fieldErrors.usefulLife} type="number" value={form.usefulLife} onChange={(e) => updateField("usefulLife", e.target.value)} />
                </FormField>
                <FormField label="Purchase Cost (NGN)" error={fieldErrors.purchaseCost}>
                  <Input aria-invalid={!!fieldErrors.purchaseCost} type="number" value={form.purchaseCost} onChange={(e) => updateField("purchaseCost", e.target.value)} />
                </FormField>
                <FormField label="Replacement Cost (NGN)" error={fieldErrors.replacementCost}>
                  <Input aria-invalid={!!fieldErrors.replacementCost} type="number" value={form.replacementCost} onChange={(e) => updateField("replacementCost", e.target.value)} />
                </FormField>
                <FormField label="Salvage Value (NGN)" error={fieldErrors.salvageValue}>
                  <Input aria-invalid={!!fieldErrors.salvageValue} type="number" value={form.salvageValue} onChange={(e) => updateField("salvageValue", e.target.value)} />
                </FormField>
                <FormField label="Depreciation Method" error={fieldErrors.depreciationMethod}>
                  <Select aria-invalid={!!fieldErrors.depreciationMethod} value={form.depreciationMethod} onChange={(e) => updateField("depreciationMethod", e.target.value)}
                    options={[{ value: "straight-line", label: "Straight Line" }, { value: "declining-balance", label: "Declining Balance" }, { value: "none", label: "None" }]} />
                </FormField>
              </div>
            )}
            {activeTab === "maintenance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Maintenance Strategy" error={fieldErrors.maintenanceStrategy}>
                  <Select aria-invalid={!!fieldErrors.maintenanceStrategy} value={form.maintenanceStrategy} onChange={(e) => updateField("maintenanceStrategy", e.target.value)}
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
              {/* Asset Image */}
              {showDetail.imageUrl && (
                <div className="flex justify-center">
                  <button onClick={() => setShowImageModal({ url: showDetail.imageUrl, name: showDetail.name })}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition max-w-xs">
                    <img src={showDetail.imageUrl} alt={showDetail.name} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full transition">
                        Click to enlarge
                      </span>
                    </div>
                  </button>
                </div>
              )}

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

        {/* Full-Size Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowImageModal(null)}>
            <div className="relative max-w-4xl max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowImageModal(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 z-10">
                <X size={16} className="text-gray-600" />
              </button>
              <img
                src={showImageModal.url}
                alt={showImageModal.name}
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
              />
              <p className="text-center text-white text-sm mt-3 font-medium">{showImageModal.name}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
