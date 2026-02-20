import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import {
  Settings, DollarSign, Database, RefreshCw, CheckCircle, AlertTriangle,
  Plus, Trash2, Edit2, Save, X, Shield, Layers, Tag, Wrench, BarChart3,
  Palette, ListChecks,
} from "lucide-react";
import toast from "react-hot-toast";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency";
import { jwtDecode } from "jwt-decode";

// ── Default constants (fallback if not customized) ──
const DEFAULT_CONSTANTS = {
  ASSET_CATEGORIES: [
    "HVAC", "Electrical", "Plumbing", "Fire-Safety", "Security",
    "IT-Network", "Elevator", "Generator", "Furniture", "Appliance",
    "Structural", "Mechanical", "Other",
  ],
  FCA_SYSTEMS: [
    "Structural", "Mechanical", "Electrical", "Plumbing",
    "HVAC", "Fire-Safety", "Security", "IT-Network",
    "Roofing", "Flooring", "Exterior", "Interior", "Other",
  ],
  HSSE_CATEGORIES: [
    "Fire Safety", "Electrical Safety", "Workplace Ergonomics",
    "Chemical Handling", "Emergency Exits", "First Aid",
    "PPE Compliance", "Housekeeping", "Signage",
    "Security Access", "CCTV", "Environmental",
  ],
  OPEX_CATEGORIES: [
    "Repairs", "Utilities", "Security", "Cleaning",
    "Diesel", "Internet", "Maintenance", "Waste", "Fleet",
  ],
  CAPEX_CATEGORIES: [
    "Plant & Machinery", "Furniture & Fittings",
    "Equipment", "Buildings", "Appliances",
  ],
  WO_STATUSES: [
    "open", "assigned", "in-progress", "on-hold", "completed", "closed", "cancelled",
  ],
  MAINTENANCE_STRATEGIES: ["RTF", "PPM", "PdM"],
};

const SECTION_CONFIG = [
  { key: "ASSET_CATEGORIES", label: "Asset Categories", icon: Tag, color: "blue", description: "Categories for classifying assets" },
  { key: "FCA_SYSTEMS", label: "FCA Systems", icon: Layers, color: "purple", description: "System classifications for FCA assessments" },
  { key: "HSSE_CATEGORIES", label: "HSSE Categories", icon: Shield, color: "emerald", description: "Categories for HSSE audit checklists" },
  { key: "OPEX_CATEGORIES", label: "OPEX Categories", icon: DollarSign, color: "orange", description: "Operational expenditure budget categories" },
  { key: "CAPEX_CATEGORIES", label: "CAPEX Categories", icon: BarChart3, color: "indigo", description: "Capital expenditure budget categories" },
  { key: "WO_STATUSES", label: "Work Order Statuses", icon: Wrench, color: "amber", description: "Status options for work orders" },
  { key: "MAINTENANCE_STRATEGIES", label: "Maintenance Strategies", icon: ListChecks, color: "teal", description: "Available maintenance strategy types" },
];

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
  const [editingSection, setEditingSection] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");

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

        // Load saved constants
        const saved = {};
        SECTION_CONFIG.forEach(({ key }) => {
          if (data[key]) {
            try {
              saved[key] = typeof data[key] === "string" ? JSON.parse(data[key]) : data[key];
            } catch {
              saved[key] = DEFAULT_CONSTANTS[key];
            }
          } else {
            saved[key] = DEFAULT_CONSTANTS[key];
          }
        });
        setConstants(saved);
      }
    } catch (err) {
      console.error(err);
      // Use defaults
      setConstants({ ...DEFAULT_CONSTANTS });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchSettings();
  }, [fetchSettings, isAdmin]);

  const handleSaveCurrency = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "currency", value: currency }),
      });
      if (res.ok) toast.success("Currency updated successfully");
      else toast.error("Failed to save currency");
    } catch { toast.error("Failed to save currency"); }
    finally { setSaving(false); }
  };

  const saveConstant = async (key, items) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: JSON.stringify(items) }),
      });
      if (res.ok) {
        setConstants((prev) => ({ ...prev, [key]: items }));
        toast.success("Updated successfully");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleAddItem = async (key) => {
    if (!newItem.trim()) return;
    const items = [...(constants[key] || []), newItem.trim()];
    await saveConstant(key, items);
    setNewItem("");
  };

  const handleDeleteItem = async (key, index) => {
    const items = (constants[key] || []).filter((_, i) => i !== index);
    await saveConstant(key, items);
  };

  const handleEditItem = async (key, index) => {
    if (!editValue.trim()) return;
    const items = [...(constants[key] || [])];
    items[index] = editValue.trim();
    await saveConstant(key, items);
    setEditingItem(null);
    setEditValue("");
  };

  const handleSeedData = async () => {
    if (!confirm("This will populate the database with demo data. Existing data will NOT be deleted. Continue?")) return;
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedResult(data);
        toast.success("Demo data seeded successfully!");
      } else {
        toast.error(data.error || "Failed to seed data");
      }
    } catch { toast.error("Failed to seed data"); }
    finally { setSeeding(false); }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <Layout>
        <Loader text="Loading settings..." />
      </Layout>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "constants", label: "System Data", icon: Database },
    { id: "seed", label: "Demo Data", icon: Layers },
  ];

  const iconColorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Settings"
          subtitle="Admin-only system configuration"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Settings" }]}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <DollarSign size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Currency</h2>
                <p className="text-sm text-gray-500">Set the default currency for the system</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.symbol} — {info.name} ({code})
                    </option>
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

            <Button
              onClick={handleSaveCurrency}
              disabled={saving}
              icon={saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            >
              {saving ? "Saving..." : "Save Currency"}
            </Button>
          </div>
        )}

        {/* Constants/System Data Tab */}
        {activeTab === "constants" && (
          <div className="space-y-4">
            {SECTION_CONFIG.map(({ key, label, icon: Icon, color, description }) => {
              const items = constants[key] || [];
              const isEditing = editingSection === key;

              return (
                <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Section header */}
                  <button
                    onClick={() => setEditingSection(isEditing ? null : key)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${iconColorMap[color] || "bg-gray-50 text-gray-600"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                        <p className="text-xs text-gray-500">{description} • {items.length} items</p>
                      </div>
                    </div>
                    <Edit2 size={16} className={isEditing ? "text-blue-500" : "text-gray-400"} />
                  </button>

                  {/* Expanded editor */}
                  {isEditing && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {/* Add new item */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newItem}
                          onChange={(e) => setNewItem(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddItem(key)}
                          placeholder={`Add new ${label.toLowerCase().replace(/s$/, "")}...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleAddItem(key)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1">
                        {items.map((item, idx) => (
                          <div key={idx}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group"
                          >
                            {editingItem === `${key}-${idx}` ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleEditItem(key, idx)}
                                  className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button onClick={() => handleEditItem(key, idx)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                                  <Save size={14} />
                                </button>
                                <button onClick={() => { setEditingItem(null); setEditValue(""); }}
                                  className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm text-gray-700">{item}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => { setEditingItem(`${key}-${idx}`); setEditValue(item); }}
                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(key, idx)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {items.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-3">No items. Add one above.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Seed Data Tab */}
        {activeTab === "seed" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Database size={22} />
              </div>
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
                  <p className="mt-1">This will create demo data for: Sites, Buildings, Spaces, Assets, Equipment (global + project-scoped), Work Orders, Maintenance Plans, Budgets, Incidents, HSSE Audits, FCA Assessments, Emergency Plans, Projects, Tasks (including tasks assigned to admin@opalshire.com), and Teams. All data is interlinked. Existing records are preserved.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSeedData}
              disabled={seeding}
              variant="outline"
              icon={seeding ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
            >
              {seeding ? "Seeding Data..." : "Seed Demo Data"}
            </Button>

            {seedResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">Seed completed successfully!</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-green-700">
                  {Object.entries(seedResult.counts || {}).map(([key, count]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <CheckCircle size={12} />
                      <span>{key}: {count}</span>
                    </div>
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
