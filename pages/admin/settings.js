import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import { Settings, DollarSign, Database, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency";

export default function SettingsPage() {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.currency) setCurrency(data.currency);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveCurrency = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "currency", value: currency }),
      });
      if (res.ok) {
        toast.success("Currency updated successfully");
      } else {
        toast.error("Failed to save currency");
      }
    } catch (err) {
      toast.error("Failed to save currency");
    } finally {
      setSaving(false);
    }
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
    } catch (err) {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Settings"
          subtitle="Configure system preferences"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Settings" }]}
        />

        {/* Currency Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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

        {/* Seed Data */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Database size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Demo Data</h2>
              <p className="text-sm text-gray-500">Populate the system with sample data for testing</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Heads up</p>
                <p className="mt-1">This will create demo Sites, Buildings, Spaces, Assets, Work Orders, Maintenance Plans, Budgets, Incidents, HSSE Audits, FCA Assessments, Emergency Plans, Projects, and Tasks. All data is interlinked. Existing records are preserved.</p>
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
      </div>
    </Layout>
  );
}
