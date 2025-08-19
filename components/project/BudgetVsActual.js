// components/project/BudgetVsActual.js
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function BudgetVsActual() {
  const [view, setView] = useState("bar"); // "bar" | "line"
  const [filter, setFilter] = useState("month"); // "day" | "week" | "month"

  // Static datasets
  const datasets = {
    day: [
      { name: "Mon", budget: 800, actual: 750 },
      { name: "Tue", budget: 900, actual: 870 },
      { name: "Wed", budget: 700, actual: 720 },
      { name: "Thu", budget: 850, actual: 830 },
      { name: "Fri", budget: 950, actual: 910 },
    ],
    week: [
      { name: "Week 1", budget: 3200, actual: 3000 },
      { name: "Week 2", budget: 3500, actual: 3400 },
      { name: "Week 3", budget: 3700, actual: 3600 },
      { name: "Week 4", budget: 4000, actual: 3900 },
    ],
    month: [
      { name: "Jan", budget: 4000, actual: 3800 },
      { name: "Feb", budget: 4200, actual: 4100 },
      { name: "Mar", budget: 4600, actual: 3900 },
      { name: "Apr", budget: 4800, actual: 4700 },
      { name: "May", budget: 5000, actual: 5200 },
    ],
  };

  const data = datasets[filter];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-100 w-full">
      {/* Title + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            Budget vs Actual
          </h2>
          <p className="text-sm text-gray-500">
            Track how actual spending compares to your planned budget.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
          {/* Filter Buttons */}
          <div className="flex justify-center sm:justify-start bg-gray-100 border-2 border-gray-200 rounded-lg p-1">
            {["day", "week", "month"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  filter === f
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-600 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Chart Toggle */}
          <div className="flex justify-center sm:justify-start gap-2">
            <button
              onClick={() => setView("bar")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                view === "bar"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setView("line")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                view === "line"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Highlight Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-xl p-4 text-center shadow-sm">
          <h3 className="text-sm text-gray-600">Total Budget</h3>
          <p className="text-lg font-bold text-indigo-600">₦22,600</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center shadow-sm">
          <h3 className="text-sm text-gray-600">Total Actual</h3>
          <p className="text-lg font-bold text-green-600">₦21,700</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {view === "bar" ? (
            <BarChart data={data} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #eee" }} />
              <Legend />
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <Bar dataKey="budget" fill="url(#budgetGradient)" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="budget" position="top" fontSize={10} />
              </Bar>
              <Bar dataKey="actual" fill="url(#actualGradient)" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="actual" position="top" fontSize={10} />
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #eee" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ r: 4, fill: "#8884d8" }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#06e63eb2"
                strokeWidth={3}
                dot={{ r: 4, fill: "#06e63eb2" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
