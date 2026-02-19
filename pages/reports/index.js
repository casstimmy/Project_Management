import { useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import { PageHeader, Button, StatCard } from "@/components/ui/SharedComponents";
import {
  FileText, Download, BarChart3, ClipboardCheck, ShieldCheck,
  Package, Wrench, DollarSign, AlertOctagon, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  {
    id: "asset-register",
    title: "Asset Register Report",
    description: "Complete list of all registered assets with lifecycle, financial, and location data.",
    icon: <Package size={24} />,
    color: "blue",
    endpoint: "/api/assets",
  },
  {
    id: "work-orders",
    title: "Work Order Summary",
    description: "All work orders with status, priority, cost, and time tracking details.",
    icon: <Wrench size={24} />,
    color: "orange",
    endpoint: "/api/workorders",
  },
  {
    id: "maintenance",
    title: "Maintenance Plans Report",
    description: "Scheduled maintenance plans with frequency, due dates, and cost estimates.",
    icon: <Calendar size={24} />,
    color: "purple",
    endpoint: "/api/maintenance",
  },
  {
    id: "fca",
    title: "FCA Assessment Report",
    description: "Facility Condition Index (FCI) data, deficiency costs, and system ratings.",
    icon: <ClipboardCheck size={24} />,
    color: "teal",
    endpoint: "/api/fca",
  },
  {
    id: "hsse",
    title: "HSSE Audit Report",
    description: "Health, Safety, Security & Environment compliance audit results.",
    icon: <ShieldCheck size={24} />,
    color: "green",
    endpoint: "/api/hsse",
  },
  {
    id: "incidents",
    title: "Incident Report",
    description: "Incident log with severity, type, investigation status, and corrective actions.",
    icon: <AlertOctagon size={24} />,
    color: "red",
    endpoint: "/api/incidents",
  },
  {
    id: "budget",
    title: "Budget Variance Report",
    description: "OPEX and CAPEX budget vs actual with line-item variance analysis.",
    icon: <DollarSign size={24} />,
    color: "indigo",
    endpoint: "/api/budgets",
  },
];

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  teal: "bg-teal-50 text-teal-600 border-teal-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  red: "bg-red-50 text-red-600 border-red-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
};

export default function ReportsPage() {
  const [generating, setGenerating] = useState(null);

  const handleExportCSV = async (report) => {
    setGenerating(report.id);
    try {
      const res = await fetch(report.endpoint);
      const data = await res.json();
      const items = data.assets || (Array.isArray(data) ? data : []);

      if (items.length === 0) {
        toast.error("No data to export");
        setGenerating(null);
        return;
      }

      // Flatten and extract CSV
      const headers = Object.keys(flattenObject(items[0]));
      const rows = items.map(item => {
        const flat = flattenObject(item);
        return headers.map(h => {
          const val = flat[h];
          return typeof val === "string" && val.includes(",") ? `"${val}"` : val ?? "";
        }).join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.id}-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${report.title} exported successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    }
    setGenerating(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Reports"
          subtitle="Generate and export facility management reports"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Reports" }]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard icon={<FileText size={20} />} label="Report Types" value={REPORT_TYPES.length} color="blue" />
          <StatCard icon={<BarChart3 size={20} />} label="Export Formats" value="CSV" color="green" subtext="PDF coming soon" />
          <StatCard icon={<Download size={20} />} label="Quick Export" value="All Modules" color="purple" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((report) => {
            const c = colorMap[report.color] || colorMap.blue;
            return (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${c}`}>
                    {report.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{report.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    icon={<Download size={14} />}
                    disabled={generating === report.id}
                    onClick={() => handleExportCSV(report)}
                  >
                    {generating === report.id ? "Generating..." : "Export CSV"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

function flattenObject(obj, prefix = "") {
  const result = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date) && key !== "_id") {
      if (val._id) {
        result[fullKey] = val.name || val.title || val._id;
      } else {
        Object.assign(result, flattenObject(val, fullKey));
      }
    } else if (Array.isArray(val)) {
      result[fullKey] = val.length;
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}
