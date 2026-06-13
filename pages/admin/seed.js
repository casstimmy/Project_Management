import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import {
  Users, Building2, Building, Layers, Package, CalendarClock,
  Wrench, AlertOctagon, ShieldCheck, Siren, ClipboardCheck, DollarSign,
  FileText, Map, Trash2, Download, RefreshCw, KeyRound, Info,
} from "lucide-react";
import toast from "react-hot-toast";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { formatCurrency } from "@/lib/currency";
import { SEED_CATALOG, SEED_DEFAULT_PASSWORD } from "@/lib/seedData";

const ICONS = {
  Users, Building2, Building, Layers, Package, CalendarClock, Wrench,
  AlertOctagon, ShieldCheck, Siren, ClipboardCheck, DollarSign, FileText, Map,
};

const totalRecords = SEED_CATALOG.reduce((sum, d) => sum + d.rows.length, 0);

export default function SeedDataPage() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadCounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/seed");
      const data = await res.json();
      setCounts(data);
    } catch {
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const existingTotal = counts ? Object.values(counts).reduce((a, b) => a + (b || 0), 0) : 0;
  const hasData = existingTotal > 0;

  const handleSeed = async (force = false) => {
    setBusy(true);
    try {
      const res = await fetchWithAuth("/api/seed", {
        method: "POST",
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Seeding failed");
      } else {
        const n = Object.values(data.created || {}).reduce((a, b) => a + b, 0);
        toast.success(`Demo data created (${n} records).`);
        loadCounts();
      }
    } catch {
      toast.error("Seeding failed");
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Remove all demo data? This deletes the demo sites and everything linked to them.")) return;
    setBusy(true);
    try {
      const res = await fetchWithAuth("/api/seed", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Clear failed");
      } else {
        const n = Object.values(data.removed || {}).reduce((a, b) => a + b, 0);
        toast.success(`Demo data removed (${n} records).`);
        loadCounts();
      }
    } catch {
      toast.error("Clear failed");
    } finally {
      setBusy(false);
    }
  };

  const renderCell = (col, row) => {
    const val = row[col.key];
    if (val == null || val === "") return <span className="text-gray-400">—</span>;
    if (col.currency) return formatCurrency(val);
    if (col.numeric) return Number(val).toLocaleString();
    return String(val);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Demo Data Seeding"
          subtitle="Populate the system with a complete, realistic facility-management dataset for demos and testing."
        />

        {/* Control panel */}
        <div className="border border-gray-200 bg-white rounded-md mb-6">
          <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Dataset Status</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? "Checking current records…" : hasData
                  ? `${existingTotal} demo records currently in the database.`
                  : "No demo records found. Seed the dataset to get started."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadCounts} disabled={busy || loading}>
                <RefreshCw size={14} className="mr-1.5" /> Refresh
              </Button>
              {hasData ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => handleSeed(true)} disabled={busy}>
                    <RefreshCw size={14} className="mr-1.5" /> Replace
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleClear} disabled={busy}>
                    <Trash2 size={14} className="mr-1.5" /> Clear Demo Data
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={() => handleSeed(false)} disabled={busy}>
                  <Download size={14} className="mr-1.5" /> Seed Demo Data
                </Button>
              )}
            </div>
          </div>

          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {SEED_CATALOG.map((ds) => {
              const Icon = ICONS[ds.icon] || Package;
              const existing = counts?.[ds.key] ?? 0;
              return (
                <div key={ds.key} className="border border-gray-200 rounded-md px-3 py-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Icon size={14} />
                    <span className="text-xs">{ds.label}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">
                    {existing}<span className="text-gray-400 font-normal"> / {ds.rows.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-blue-200 bg-blue-50 text-blue-800 text-sm px-4 py-3 mb-2 flex items-start gap-2">
          <KeyRound size={16} className="mt-0.5 shrink-0" />
          <span>
            Seeded login accounts use the email shown in the <strong>Team &amp; Users</strong> table below.
            Default password for all of them: <code className="px-1 py-0.5 bg-white border border-blue-200 rounded text-xs font-mono">{SEED_DEFAULT_PASSWORD}</code>
          </span>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3 mb-6 flex items-start gap-2">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            Clearing demo data only removes the {totalRecords} demo records (the demo sites and everything linked to them, plus
            <code className="px-1 mx-1 bg-white border border-amber-200 rounded text-xs font-mono">@opal.test</code> accounts). Your own data is untouched.
          </span>
        </div>

        {/* Dataset preview tables */}
        <div className="space-y-6">
          {SEED_CATALOG.map((ds) => {
            const Icon = ICONS[ds.icon] || Package;
            return (
              <section key={ds.key} className="border border-gray-200 bg-white rounded-md overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-800">{ds.label}</h3>
                    <span className="text-xs text-gray-500">({ds.rows.length} records)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{ds.narration}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-white">
                        <th className="text-left font-medium text-gray-500 px-4 py-2 w-10">#</th>
                        {ds.columns.map((col) => (
                          <th
                            key={col.key}
                            className={`font-medium text-gray-500 px-4 py-2 whitespace-nowrap ${col.currency || col.numeric ? "text-right" : "text-left"}`}
                          >
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ds.rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                          {ds.columns.map((col) => (
                            <td
                              key={col.key}
                              className={`px-4 py-2 text-gray-700 whitespace-nowrap ${col.currency || col.numeric ? "text-right tabular-nums" : "text-left"}`}
                            >
                              {renderCell(col, row)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
