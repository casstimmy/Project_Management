import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, DataTable, StatusBadge, PriorityBadge,
  Button, Modal, FormField, Input, Select, Textarea, Tabs,
} from "@/components/ui/SharedComponents";
import {
  ClipboardList, Plus, Edit, Trash2, Eye, Clock,
  User, AlertTriangle, Wrench, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const WO_TYPES = [
  { value: "preventive", label: "Preventive" }, { value: "predictive", label: "Predictive" },
  { value: "reactive", label: "Reactive" }, { value: "emergency", label: "Emergency" },
  { value: "inspection", label: "Inspection" },
];
const PRIORITIES = [
  { value: "low", label: "Low" }, { value: "medium", label: "Medium" },
  { value: "high", label: "High" }, { value: "critical", label: "Critical" },
];
const WO_STATUSES = [
  { value: "open", label: "Open" }, { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" }, { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" }, { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", type: "reactive", priority: "medium", status: "open",
    asset: "", site: "", building: "",
    requestedBy: "", assignedTo: "",
    scheduledDate: "", completedDate: "",
    estimatedHours: "", actualHours: "", downtime: "",
    laborCost: "", materialCost: "",
  });

  useEffect(() => {
    fetch("/api/assets").then(r => r.json()).then(d => setAssets(d.assets || (Array.isArray(d) ? d : [])));
  }, []);

  const fetchWO = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
      const res = await fetch(`/api/workorders?${q}`);
      const data = await res.json();
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchWO(); }, [fetchWO]);

  const resetForm = () => setForm({
    title: "", description: "", type: "reactive", priority: "medium", status: "open",
    asset: "", site: "", building: "",
    requestedBy: "", assignedTo: "",
    scheduledDate: "", completedDate: "",
    estimatedHours: "", actualHours: "", downtime: "",
    laborCost: "", materialCost: "",
  });

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Title is required");
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, _id: editing._id } : form;
    try {
      const res = await fetch("/api/workorders", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Work order updated" : "Work order created");
        setShowModal(false); setEditing(null); resetForm(); fetchWO();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this work order?")) return;
    try {
      await fetch(`/api/workorders?id=${id}`, { method: "DELETE" });
      toast.success("Deleted"); fetchWO();
    } catch { toast.error("Failed to delete"); }
  };

  const openEdit = (wo) => {
    setEditing(wo);
    setForm({
      title: wo.title, description: wo.description || "",
      type: wo.type, priority: wo.priority, status: wo.status,
      asset: wo.asset?._id || "", site: wo.site?._id || "", building: wo.building?._id || "",
      requestedBy: wo.requestedBy || "", assignedTo: wo.assignedTo || "",
      scheduledDate: wo.scheduledDate?.split("T")[0] || "",
      completedDate: wo.completedDate?.split("T")[0] || "",
      estimatedHours: wo.estimatedHours || "", actualHours: wo.actualHours || "",
      downtime: wo.downtime || "",
      laborCost: wo.laborCost || "", materialCost: wo.materialCost || "",
    });
    setShowModal(true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";
  const formatCurrency = (v) => v ? `₦${Number(v).toLocaleString()}` : "—";

  const columns = [
    { header: "Work Order", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <ClipboardList size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400">{row.workOrderNumber || "—"}</p>
        </div>
      </div>
    )},
    { header: "Type", render: (row) => <span className="capitalize text-gray-600 text-sm">{row.type}</span> },
    { header: "Priority", render: (row) => <PriorityBadge priority={row.priority} /> },
    { header: "Asset", render: (row) => <span className="text-gray-600 text-sm">{row.asset?.name || "—"}</span> },
    { header: "Scheduled", render: (row) => <span className="text-sm text-gray-600">{formatDate(row.scheduledDate)}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    )},
  ];

  const openCount = workOrders.filter(w => w.status === "open").length;
  const inProgressCount = workOrders.filter(w => w.status === "in-progress").length;
  const criticalCount = workOrders.filter(w => w.priority === "critical" || w.priority === "high").length;
  const completedCount = workOrders.filter(w => w.status === "completed" || w.status === "closed").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Work Orders"
          subtitle="Manage maintenance work orders and requests"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Maintenance" }, { label: "Work Orders" }]}
          actions={
            <Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>
              New Work Order
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<ClipboardList size={20} />} label="Open" value={openCount} color="blue" />
          <StatCard icon={<Wrench size={20} />} label="In Progress" value={inProgressCount} color="yellow" />
          <StatCard icon={<AlertTriangle size={20} />} label="Critical/High" value={criticalCount} color="red" />
          <StatCard icon={<Calendar size={20} />} label="Completed" value={completedCount} color="green" />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[{ value: "", label: "All" }, ...WO_STATUSES].map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${statusFilter === s.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns} data={workOrders} loading={loading}
          onSearch={setSearch} searchValue={search}
          searchPlaceholder="Search work orders..."
          emptyMessage="No work orders found."
        />

        {/* Create / Edit Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }}
          title={editing ? "Edit Work Order" : "New Work Order"} size="xl"
          footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Title" required className="md:col-span-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief description of work required" />
            </FormField>
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={WO_TYPES} />
            </FormField>
            <FormField label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={PRIORITIES} />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={WO_STATUSES} />
            </FormField>
            <FormField label="Asset">
              <Select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })}
                placeholder="Select asset" options={assets.map(a => ({ value: a._id, label: `${a.name} (${a.assetTag || "—"})` }))} />
            </FormField>
            <FormField label="Scheduled Date">
              <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            </FormField>
            <FormField label="Completed Date">
              <Input type="date" value={form.completedDate} onChange={(e) => setForm({ ...form, completedDate: e.target.value })} />
            </FormField>
            <FormField label="Estimated Hours">
              <Input type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
            </FormField>
            <FormField label="Actual Hours">
              <Input type="number" value={form.actualHours} onChange={(e) => setForm({ ...form, actualHours: e.target.value })} />
            </FormField>
            <FormField label="Labor Cost ($)">
              <Input type="number" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })} />
            </FormField>
            <FormField label="Material Cost ($)">
              <Input type="number" value={form.materialCost} onChange={(e) => setForm({ ...form, materialCost: e.target.value })} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || "Work Order Detail"} size="lg">
          {showDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">WO Number</p>
                  <p className="font-semibold text-sm">{showDetail.workOrderNumber || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-sm capitalize">{showDetail.type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Priority</p>
                  <PriorityBadge priority={showDetail.priority} />
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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Asset</span><span>{showDetail.asset?.name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Scheduled</span><span>{formatDate(showDetail.scheduledDate)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Est. Hours</span><span>{showDetail.estimatedHours || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Actual Hours</span><span>{showDetail.actualHours || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Labor Cost</span><span>{formatCurrency(showDetail.laborCost)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Material Cost</span><span>{formatCurrency(showDetail.materialCost)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Cost</span><span className="font-medium">{formatCurrency(showDetail.totalCost)}</span></div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
