// components/project/Reports.js
import { useState } from "react";

export default function Reports() {
  const [view, setView] = useState("weekly"); // default view

  const reports = {
    daily: [
      {
        day: "Monday",
        summary: "Soil watered and herb garden maintained.",
        milestones: ["Watered herbs and vegetables", "Checked irrigation flow"],
        issues: ["Minor pest spots on mint leaves"],
        nextPlan: ["Spray natural pesticide", "Check soil pH levels"],
        teamNotes: "Quick work, garden looks healthy.",
      },
      {
        day: "Tuesday",
        summary: "Vegetables pruned and compost added.",
        milestones: ["Pruned tomato plants", "Added organic compost"],
        issues: ["Compost bin filling up too fast"],
        nextPlan: ["Turn compost heap", "Prepare cucumber trellis"],
        teamNotes: "Team worked efficiently today.",
      },
    ],
    weekly: [
      {
        week: 1,
        summary: "Project kickoff, site assessment, and soil preparation completed.",
        milestones: [
          "Kick-off meeting with garden team conducted",
          "Soil quality tested and cleared for planting",
          "Garden layout plan finalized",
        ],
        issues: ["Delay in delivery of compost and fertilizers", "Weather slowed prep work"],
        nextPlan: ["Install irrigation system", "Mark planting beds", "Procure seedlings"],
        teamNotes: "Team enthusiastic to start planting and design execution.",
      },
      {
        week: 2,
        summary: "Irrigation system installed and first planting started.",
        milestones: ["Installed drip irrigation", "Marked pathways", "Planted herbs"],
        issues: ["Seedlings shortage", "Minor irrigation leakage"],
        nextPlan: ["Fix leakage", "Plant vegetables", "Start composting"],
        teamNotes: "Smooth teamwork with volunteers.",
      },
    ],
    monthly: [
      {
        month: "January",
        summary: "Garden setup and first round of planting completed.",
        milestones: [
          "Irrigation installed",
          "Herbs and vegetables planted",
          "Compost bin setup",
        ],
        issues: ["Heavy rains caused soil erosion", "Pest attack on herbs"],
        nextPlan: [
          "Reinforce soil beds",
          "Introduce organic pest control",
          "Organize community open day",
        ],
        teamNotes: "Garden is shaping up beautifully with steady progress.",
      },
      {
        month: "February",
        summary: "Maintenance and pest control activities ongoing.",
        milestones: [
          "Applied organic pest spray",
          "Added mulch to all beds",
          "Community day event conducted",
        ],
        issues: ["Some plants wilted due to excess rain"],
        nextPlan: ["Replant wilted sections", "Build rainwater harvesting barrel"],
        teamNotes: "Community involvement was excellent this month.",
      },
    ],
  };

  const currentReports = reports[view];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-2xl border border-gray-100">
      {/* Title with dynamic view */}
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Reports{" "}
        <span className="text-sm font-medium text-gray-500 ml-2">
          ({view.charAt(0).toUpperCase() + view.slice(1)})
        </span>
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["daily", "weekly", "monthly"].map((type) => (
          <button
            key={type}
            onClick={() => setView(type)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              view === type
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentReports.map((report, i) => (
          <div
            key={i}
            className="flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-2">
              <h3 className="font-semibold">
                {view === "daily" && report.day}
                {view === "weekly" && `Week ${report.week}`}
                {view === "monthly" && report.month}
              </h3>
              <p className="text-xs opacity-80">{report.summary}</p>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-64">
              <Section title="✅ Milestones" items={report.milestones} color="text-gray-600" />
              <Section title="⚠️ Issues" items={report.issues} color="text-red-600" />
              <Section title="📌 Next Plan" items={report.nextPlan} color="text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">👥 Team Notes</h4>
                <p className="text-xs text-gray-600">{report.teamNotes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, items, color }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <ul className={`list-disc pl-5 text-xs ${color} space-y-1`}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
