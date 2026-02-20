import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import {
  Settings, DollarSign, Database, RefreshCw, CheckCircle, AlertTriangle,
  Plus, Trash2, Edit2, Save, X, Shield, Layers, Tag, Wrench, BarChart3,
  Palette, ListChecks, Calendar, PieChart, ChevronDown, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency";
import { jwtDecode } from "jwt-decode";

/* ══════════════════════════════════════════════════════════════
   Default constants — fallback when no override saved in DB.
   Each section has a `type` so we can render the right editor.
   ══════════════════════════════════════════════════════════════ */
const DEFAULT_CONSTANTS = {
  ASSET_CATEGORIES: ["HVAC","Electrical","Plumbing","Fire-Safety","Security","IT-Network","Elevator","Generator","Furniture","Appliance","Structural","Mechanical","Other"],
  FCA_SYSTEMS: ["Structural","Mechanical","Electrical","Plumbing","HVAC","Fire-Safety","Security","IT-Network","Roofing","Flooring","Exterior","Interior","Other"],
  HSSE_CATEGORIES: ["Fire Safety","Electrical Safety","Workplace Ergonomics","Chemical Handling","Emergency Exits","First Aid","PPE Compliance","Housekeeping","Signage","Security Access","CCTV","Environmental"],
  OPEX_CATEGORIES: ["Repairs","Utilities","Security","Cleaning","Diesel","Internet","Maintenance","Waste","Fleet"],
  CAPEX_CATEGORIES: ["Plant & Machinery","Furniture & Fittings","Equipment","Buildings","Appliances"],
  MAINTENANCE_STRATEGIES: [
    { value: "RTF", label: "Run-to-Failure (RTF)" },
    { value: "PPM", label: "Planned Preventive Maintenance (PPM)" },
    { value: "PdM", label: "Predictive Maintenance (PdM)" },
  ],
  CONDITION_RATINGS: [
    { value: 1, label: "Critical", color: "#EF4444" },
    { value: 2, label: "Poor",     color: "#F97316" },
    { value: 3, label: "Fair",     color: "#EAB308" },
    { value: 4, label: "Good",     color: "#22C55E" },
    { value: 5, label: "Excellent",color: "#3B82F6" },
  ],
  WO_STATUSES: [
    { value: "open",        label: "Open",        color: "#3B82F6" },
    { value: "assigned",    label: "Assigned",    color: "#8B5CF6" },
    { value: "in-progress", label: "In Progress", color: "#F59E0B" },
    { value: "on-hold",     label: "On Hold",     color: "#6B7280" },
    { value: "completed",   label: "Completed",   color: "#22C55E" },
    { value: "closed",      label: "Closed",      color: "#1F2937" },
    { value: "cancelled",   label: "Cancelled",   color: "#EF4444" },
  ],
  RISK_LEVELS: {
    Low:     { color: "#22C55E", bg: "#F0FDF4" },
    Medium:  { color: "#EAB308", bg: "#FEFCE8" },
    High:    { color: "#F97316", bg: "#FFF7ED" },
    Extreme: { color: "#EF4444", bg: "#FEF2F2" },
  },
  PRIORITY_COLORS: {
    low:      { text: "#22C55E", bg: "#F0FDF4" },
    medium:   { text: "#EAB308", bg: "#FEFCE8" },
    high:     { text: "#F97316", bg: "#FFF7ED" },
    critical: { text: "#EF4444", bg: "#FEF2F2" },
  },
  CHART_COLORS: ["#3B82F6","#22C55E","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899","#F97316","#14B8A6","#6366F1"],
  MONTHS: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

/*
  type = "simple"            → plain string array
  type = "value-label"       → [{value, label}]
  type = "value-label-color" → [{value, label, color}]
  type = "key-color-bg"      → { key: {color|text, bg} }
  type = "color-list"        → string[] of hex colors
  type = "month-list"        → string[] of month names (read-only)
*/
const SECTION_CONFIG = [
  { key: "ASSET_CATEGORIES",       label: "Asset Categories",       icon: Tag,           color: "blue",    type: "simple",            description: "Categories for classifying assets" },
  { key: "FCA_SYSTEMS",            label: "FCA Systems",            icon: Layers,        color: "purple",  type: "simple",            description: "System classifications for FCA assessments" },
  { key: "HSSE_CATEGORIES",        label: "HSSE Categories",        icon: Shield,        color: "emerald", type: "simple",            description: "Categories for HSSE audit checklists" },
  { key: "OPEX_CATEGORIES",        label: "OPEX Categories",        icon: DollarSign,    color: "orange",  type: "simple",            description: "Operational expenditure budget categories" },
  { key: "CAPEX_CATEGORIES",       label: "CAPEX Categories",       icon: BarChart3,     color: "indigo",  type: "simple",            description: "Capital expenditure budget categories" },
  { key: "MAINTENANCE_STRATEGIES", label: "Maintenance Strategies", icon: ListChecks,    color: "teal",    type: "value-label",       description: "Strategy options with value codes & labels" },
  { key: "CONDITION_RATINGS",      label: "Condition Ratings",      icon: BarChart3,     color: "green",   type: "value-label-color", description: "Ratings with numeric value, label & color" },
  { key: "WO_STATUSES",            label: "Work Order Statuses",    icon: Wrench,        color: "amber",   type: "value-label-color", description: "Status options with value, label & color" },
  { key: "RISK_LEVELS",            label: "Risk Levels",            icon: AlertTriangle, color: "red",     type: "key-color-bg",      description: "Risk levels with text color & background" },
  { key: "PRIORITY_COLORS",        label: "Priority Colors",        icon: Palette,       color: "pink",    type: "key-color-bg",      description: "Priority levels with text color & background" },
  { key: "CHART_COLORS",           label: "Chart Color Palette",    icon: PieChart,      color: "cyan",    type: "color-list",        description: "Color palette for dashboard charts" },
  { key: "MONTHS",                 label: "Month Labels",           icon: Calendar,      color: "gray",    type: "month-list",        description: "Month display names (read-only)" },
];

const ICON_COLORS = {
  blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600",
  emerald: "bg-emerald-50 text-emerald-600", orange: "bg-orange-50 text-orange-600",
  indigo: "bg-indigo-50 text-indigo-600", amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600", green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600", pink: "bg-pink-50 text-pink-600",
  cyan: "bg-cyan-50 text-cyan-600", gray: "bg-gray-100 text-gray-600",
};

export default function SettingsPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Constants state
  const [constants, setConstants] = useState({});
  const [openSection, setOpenSection] = useState(null);

  // Inline form state for each type
  const [newSimple, setNewSimple] = useState("");
  const [newVL, setNewVL] = useState({ value: "", label: "" });
  const [newVLC, setNewVLC] = useState({ value: "", label: "", color: "#3B82F6" });
  const [newKCB, setNewKCB] = useState({ key: "", color: "#3B82F6", bg: "#F0FDF4" });
  const [newColor, setNewColor] = useState("#3B82F6");
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState(null);

  // Check admin access
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push("/homePage");
        return;
      }
      setIsAdmin(true);
    } catch {
      router.push("/");
    }
  }, [router]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.currency) setCurrency(data.currency);
        const saved = {};
        SECTION_CONFIG.forEach(({ key }) => {
          if (data[key]) {
            try { saved[key] = typeof data[key] === "string" ? JSON.parse(data[key]) : data[key]; }
            catch { saved[key] = DEFAULT_CONSTANTS[key]; }
          } else {
            saved[key] = DEFAULT_CONSTANTS[key];
          }
        });
        setConstants(saved);
      }
    } catch { setConstants({ ...DEFAULT_CONSTANTS }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAdmin) fetchSettings(); }, [fetchSettings, isAdmin]);

  // ── Save helper ──
  const saveConstant = async (key, value) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: JSON.stringify(value) }),
      });
      if (res.ok) { setConstants(p => ({ ...p, [key]: value })); toast.success("Saved"); }
      else toast.error("Failed to save");
    } catch { toast.error("Failed to save"); }
  };

  // Currency
  const handleSaveCurrency = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "currency", value: currency }),
      });
      if (res.ok) toast.success("Currency updated"); else toast.error("Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  // Seed
  const handleSeedData = async () => {
    if (!confirm("This will clear existing demo data and re-create fresh seed data. User accounts are preserved. Continue?")) return;
    setSeeding(true); setSeedResult(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) { setSeedResult(data); toast.success("Demo data seeded!"); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSeeding(false); }
  };

  // ── CRUD helpers (per type) ──
  const addSimple = (key) => {
    if (!newSimple.trim()) return;
    saveConstant(key, [...(constants[key] || []), newSimple.trim()]);
    setNewSimple("");
  };
  const addVL = (key) => {
    if (!newVL.value.trim() || !newVL.label.trim()) return;
    saveConstant(key, [...(constants[key] || []), { ...newVL }]);
    setNewVL({ value: "", label: "" });
  };
  const addVLC = (key) => {
    if (!newVLC.value.trim() || !newVLC.label.trim()) return;
    saveConstant(key, [...(constants[key] || []), { ...newVLC }]);
    setNewVLC({ value: "", label: "", color: "#3B82F6" });
  };
  const addKCB = (key) => {
    if (!newKCB.key.trim()) return;
    const obj = { ...(constants[key] || {}) };
    const colorKey = key === "PRIORITY_COLORS" ? "text" : "color";
    obj[newKCB.key.trim()] = { [colorKey]: newKCB.color, bg: newKCB.bg };
    saveConstant(key, obj);
    setNewKCB({ key: "", color: "#3B82F6", bg: "#F0FDF4" });
  };
  const addColor = (key) => {
    if (!newColor) return;
    saveConstant(key, [...(constants[key] || []), newColor]);
    setNewColor("#3B82F6");
  };
  const deleteItem = (key, idx) => {
    const items = [...(constants[key] || [])];
    items.splice(idx, 1);
    saveConstant(key, items);
    if (editIdx === idx) { setEditIdx(null); setEditData(null); }
  };
  const deleteKCBKey = (sectionKey, itemKey) => {
    const obj = { ...(constants[sectionKey] || {}) };
    delete obj[itemKey];
    saveConstant(sectionKey, obj);
    if (editIdx === itemKey) { setEditIdx(null); setEditData(null); }
  };
  const startEdit = (idx, data) => { setEditIdx(idx); setEditData(data); };
  const cancelEdit = () => { setEditIdx(null); setEditData(null); };
  const saveEdit = (key, idx) => {
    const items = [...(constants[key] || [])];
    items[idx] = editData;
    saveConstant(key, items);
    cancelEdit();
  };
  const saveEditKCB = (sectionKey, itemKey) => {
    const obj = { ...(constants[sectionKey] || {}) };
    obj[itemKey] = editData;
    saveConstant(sectionKey, obj);
    cancelEdit();
  };
  const resetToDefault = (key) => {
    if (!confirm(`Reset "${SECTION_CONFIG.find(s=>s.key===key)?.label}" to default values?`)) return;
    saveConstant(key, DEFAULT_CONSTANTS[key]);
  };

  if (!isAdmin) return null;
  if (loading) return <Layout><Loader text="Loading settings..." /></Layout>;

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "constants", label: "System Data", icon: Database },
    { id: "seed", label: "Demo Data", icon: Layers },
  ];

  const itemCount = (key, type) => {
    const d = constants[key];
    if (!d) return 0;
    if (type === "key-color-bg") return Object.keys(d).length;
    return Array.isArray(d) ? d.length : 0;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Settings" subtitle="Admin-only system configuration"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Settings" }]} />

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* ────────── GENERAL TAB ────────── */}
        {activeTab === "general" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><DollarSign size={22} /></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Currency</h2>
                <p className="text-sm text-gray-500">Set the default currency for the system</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <option key={code} value={code}>{info.symbol} — {info.name} ({code})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 w-full">
                  <p className="text-xs text-gray-500 mb-1">Preview</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY]).symbol}1,250,000
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleSaveCurrency} disabled={saving}
              icon={saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}>
              {saving ? "Saving..." : "Save Currency"}
            </Button>
          </div>
        )}

        {/* ────────── SYSTEM DATA TAB ────────── */}
        {activeTab === "constants" && (
          <div className="space-y-3">
            {SECTION_CONFIG.map(({ key, label, icon: Icon, color, type, description }) => {
              const isOpen = openSection === key;
              return (
                <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <button onClick={() => { setOpenSection(isOpen ? null : key); cancelEdit(); }}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${ICON_COLORS[color] || ICON_COLORS.gray}`}><Icon size={18} /></div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                        <p className="text-xs text-gray-500">{description} · {itemCount(key, type)} items</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronDown size={16} className="text-blue-500" /> : <ChevronRight size={16} className="text-gray-400" />}
                  </button>

                  {/* Body */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-3">

                      {/* ── SIMPLE STRING ARRAY ── */}
                      {type === "simple" && (<>
                        <div className="flex gap-2">
                          <input value={newSimple} onChange={e=>setNewSimple(e.target.value)}
                            onKeyDown={e=>e.key==="Enter"&&addSimple(key)}
                            placeholder="Add new item..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <button onClick={()=>addSimple(key)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        <div className="space-y-1">
                          {(constants[key]||[]).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group">
                              {editIdx === idx ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input value={editData} onChange={e=>setEditData(e.target.value)}
                                    onKeyDown={e=>e.key==="Enter"&&saveEdit(key,idx)} autoFocus
                                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                  <button onClick={()=>saveEdit(key,idx)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={14} /></button>
                                  <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                                </div>
                              ) : (<>
                                <span className="text-sm text-gray-700">{item}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={()=>startEdit(idx,item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                                  <button onClick={()=>deleteItem(key,idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                                </div>
                              </>)}
                            </div>
                          ))}
                        </div>
                      </>)}

                      {/* ── VALUE + LABEL ── */}
                      {type === "value-label" && (<>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-0.5 block">Value (code)</label>
                            <input value={newVL.value} onChange={e=>setNewVL({...newVL,value:e.target.value})}
                              placeholder="e.g. PPM" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="flex-[2]">
                            <label className="text-xs text-gray-500 mb-0.5 block">Label (display name)</label>
                            <input value={newVL.label} onChange={e=>setNewVL({...newVL,label:e.target.value})}
                              placeholder="e.g. Planned Preventive Maintenance" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <button onClick={()=>addVL(key)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 h-fit">
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        <div className="space-y-1">
                          {(constants[key]||[]).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group">
                              {editIdx === idx ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input value={editData?.value||""} onChange={e=>setEditData({...editData,value:e.target.value})}
                                    className="w-24 px-2 py-1 border border-blue-300 rounded text-sm" placeholder="Value" />
                                  <input value={editData?.label||""} onChange={e=>setEditData({...editData,label:e.target.value})}
                                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm" placeholder="Label" />
                                  <button onClick={()=>saveEdit(key,idx)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={14} /></button>
                                  <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                                </div>
                              ) : (<>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.value}</code>
                                  <span className="text-sm text-gray-700">{item.label}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={()=>startEdit(idx,{...item})} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                                  <button onClick={()=>deleteItem(key,idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                                </div>
                              </>)}
                            </div>
                          ))}
                        </div>
                      </>)}

                      {/* ── VALUE + LABEL + COLOR ── */}
                      {type === "value-label-color" && (<>
                        <div className="flex gap-2 items-end flex-wrap">
                          <div className="w-28">
                            <label className="text-xs text-gray-500 mb-0.5 block">Value</label>
                            <input value={newVLC.value} onChange={e=>setNewVLC({...newVLC,value:e.target.value})}
                              placeholder="e.g. open" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="flex-1 min-w-[140px]">
                            <label className="text-xs text-gray-500 mb-0.5 block">Label</label>
                            <input value={newVLC.label} onChange={e=>setNewVLC({...newVLC,label:e.target.value})}
                              placeholder="e.g. Open" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="w-24">
                            <label className="text-xs text-gray-500 mb-0.5 block">Color</label>
                            <div className="flex items-center gap-1.5">
                              <input type="color" value={newVLC.color} onChange={e=>setNewVLC({...newVLC,color:e.target.value})}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                              <input value={newVLC.color} onChange={e=>setNewVLC({...newVLC,color:e.target.value})}
                                className="w-20 px-1.5 py-1 border border-gray-300 rounded text-xs font-mono" />
                            </div>
                          </div>
                          <button onClick={()=>addVLC(key)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 h-fit">
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        <div className="space-y-1">
                          {(constants[key]||[]).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group">
                              {editIdx === idx ? (
                                <div className="flex items-center gap-2 flex-1 flex-wrap">
                                  <input value={editData?.value??""} onChange={e=>setEditData({...editData,value:e.target.value})}
                                    className="w-24 px-2 py-1 border border-blue-300 rounded text-sm" placeholder="Value" />
                                  <input value={editData?.label??""} onChange={e=>setEditData({...editData,label:e.target.value})}
                                    className="flex-1 min-w-[100px] px-2 py-1 border border-blue-300 rounded text-sm" placeholder="Label" />
                                  <input type="color" value={editData?.color||"#000"} onChange={e=>setEditData({...editData,color:e.target.value})} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                                  <input value={editData?.color||""} onChange={e=>setEditData({...editData,color:e.target.value})}
                                    className="w-20 px-1 py-1 border border-blue-300 rounded text-xs font-mono" />
                                  <button onClick={()=>saveEdit(key,idx)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={14} /></button>
                                  <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                                </div>
                              ) : (<>
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200" style={{ backgroundColor: item.color }} />
                                  <code className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.value}</code>
                                  <span className="text-sm text-gray-700">{item.label}</span>
                                  <span className="text-xs text-gray-400 font-mono">{item.color}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={()=>startEdit(idx,{...item})} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                                  <button onClick={()=>deleteItem(key,idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                                </div>
                              </>)}
                            </div>
                          ))}
                        </div>
                      </>)}

                      {/* ── KEY → {color, bg} MAP ── */}
                      {type === "key-color-bg" && (<>
                        <div className="flex gap-2 items-end flex-wrap">
                          <div className="w-28">
                            <label className="text-xs text-gray-500 mb-0.5 block">Key</label>
                            <input value={newKCB.key} onChange={e=>setNewKCB({...newKCB,key:e.target.value})}
                              placeholder="e.g. High" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Text Color</label>
                            <div className="flex items-center gap-1">
                              <input type="color" value={newKCB.color} onChange={e=>setNewKCB({...newKCB,color:e.target.value})} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                              <input value={newKCB.color} onChange={e=>setNewKCB({...newKCB,color:e.target.value})} className="w-20 px-1 py-1 border border-gray-300 rounded text-xs font-mono" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Background</label>
                            <div className="flex items-center gap-1">
                              <input type="color" value={newKCB.bg} onChange={e=>setNewKCB({...newKCB,bg:e.target.value})} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                              <input value={newKCB.bg} onChange={e=>setNewKCB({...newKCB,bg:e.target.value})} className="w-20 px-1 py-1 border border-gray-300 rounded text-xs font-mono" />
                            </div>
                          </div>
                          <button onClick={()=>addKCB(key)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 h-fit">
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(constants[key]||{}).map(([k, v]) => {
                            const textKey = v.text !== undefined ? "text" : "color";
                            return (
                            <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group">
                              {editIdx === k ? (
                                <div className="flex items-center gap-2 flex-1 flex-wrap">
                                  <span className="text-sm font-medium text-gray-700 w-20">{k}</span>
                                  <input type="color" value={editData?.[textKey]||"#000"} onChange={e=>setEditData({...editData,[textKey]:e.target.value})} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                                  <input value={editData?.[textKey]||""} onChange={e=>setEditData({...editData,[textKey]:e.target.value})} className="w-20 px-1 py-1 border border-blue-300 rounded text-xs font-mono" />
                                  <input type="color" value={editData?.bg||"#fff"} onChange={e=>setEditData({...editData,bg:e.target.value})} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                                  <input value={editData?.bg||""} onChange={e=>setEditData({...editData,bg:e.target.value})} className="w-20 px-1 py-1 border border-blue-300 rounded text-xs font-mono" />
                                  <button onClick={()=>saveEditKCB(key,k)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={14} /></button>
                                  <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                                </div>
                              ) : (<>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-700 w-20">{k}</span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: v[textKey] }} />
                                    <span className="text-xs font-mono text-gray-500">{v[textKey]}</span>
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: v.bg }} />
                                    <span className="text-xs font-mono text-gray-500">{v.bg}</span>
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: v[textKey], backgroundColor: v.bg }}>{k}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={()=>startEdit(k,{...v})} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                                  <button onClick={()=>deleteKCBKey(key,k)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                                </div>
                              </>)}
                            </div>
                          );})}
                        </div>
                      </>)}

                      {/* ── COLOR LIST ── */}
                      {type === "color-list" && (<>
                        <div className="flex gap-2 items-end">
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Color</label>
                            <div className="flex items-center gap-1.5">
                              <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                              <input value={newColor} onChange={e=>setNewColor(e.target.value)} className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono" />
                            </div>
                          </div>
                          <button onClick={()=>addColor(key)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 h-fit">
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(constants[key]||[]).map((hex, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5 group border border-gray-200">
                              {editIdx === idx ? (<>
                                <input type="color" value={editData||hex} onChange={e=>setEditData(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                                <input value={editData||""} onChange={e=>setEditData(e.target.value)} className="w-20 px-1 py-0.5 border border-blue-300 rounded text-xs font-mono" />
                                <button onClick={()=>saveEdit(key,idx)} className="p-0.5 text-emerald-600"><Save size={12} /></button>
                                <button onClick={cancelEdit} className="p-0.5 text-gray-400"><X size={12} /></button>
                              </>) : (<>
                                <span className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: hex }} />
                                <span className="text-xs font-mono text-gray-600">{hex}</span>
                                <button onClick={()=>startEdit(idx,hex)} className="p-0.5 text-blue-500 opacity-0 group-hover:opacity-100"><Edit2 size={11} /></button>
                                <button onClick={()=>deleteItem(key,idx)} className="p-0.5 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={11} /></button>
                              </>)}
                            </div>
                          ))}
                        </div>
                      </>)}

                      {/* ── MONTH LIST (read-only) ── */}
                      {type === "month-list" && (
                        <div className="flex flex-wrap gap-2">
                          {(constants[key]||[]).map((m, idx) => (
                            <span key={idx} className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">{m}</span>
                          ))}
                          <p className="text-xs text-gray-400 w-full mt-1">Month names are fixed and cannot be edited.</p>
                        </div>
                      )}

                      {/* Reset to defaults */}
                      {type !== "month-list" && (
                        <div className="pt-2 border-t border-gray-100 mt-2">
                          <button onClick={()=>resetToDefault(key)} className="text-xs text-gray-400 hover:text-red-500 transition">
                            Reset to defaults
                          </button>
                        </div>
                      )}

                      {(type !== "key-color-bg" && type !== "color-list" && type !== "month-list") && (constants[key]||[]).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-3">No items. Add one above.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ────────── SEED DATA TAB ────────── */}
        {activeTab === "seed" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Database size={22} /></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Demo Data</h2>
                <p className="text-sm text-gray-500">Populate the system with comprehensive sample data for testing</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Full System Seed</p>
                  <p className="mt-1">This will <strong>clear and re-create</strong> demo data for: Sites, Buildings, Spaces, Assets, Equipment, Work Orders, Maintenance Plans, Budgets, Incidents, HSSE Audits, FCA Assessments, Emergency Plans, Projects, Tasks, and Teams. User accounts are preserved.</p>
                </div>
              </div>
            </div>
            <Button onClick={handleSeedData} disabled={seeding} variant="outline"
              icon={seeding ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}>
              {seeding ? "Seeding Data..." : "Seed Demo Data"}
            </Button>
            {seedResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">Seed completed successfully!</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-green-700">
                  {Object.entries(seedResult.counts || {}).map(([k, c]) => (
                    <div key={k} className="flex items-center gap-1.5"><CheckCircle size={12} /><span>{k}: {c}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
