import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import { useState } from "react";
import { ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const today = new Date();
const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const tasks = [
  {
    start: today,
    end: addDays(today, 5),
    name: "📦 Project Initiation",
    id: "Task_0",
    type: "task",
    progress: 70,
    isDisabled: false,
    styles: { progressColor: "#2563eb", progressSelectedColor: "#1e40af" },
  },
  {
    start: addDays(today, 6),
    end: addDays(today, 12),
    name: "🎨 UI/UX Design Phase",
    id: "Task_1",
    type: "task",
    progress: 20,
    dependencies: ["Task_0"],
    styles: { progressColor: "#14b8a6", progressSelectedColor: "#0f766e" },
  },
  {
    start: addDays(today, 13),
    end: addDays(today, 20),
    name: "🛠️ Frontend Development",
    id: "Task_2",
    type: "task",
    progress: 10,
    dependencies: ["Task_1"],
    styles: { progressColor: "#f59e0b", progressSelectedColor: "#b45309" },
  },
  {
    start: addDays(today, 20),
    end: addDays(today, 28),
    name: "⚙️ Backend Integration",
    id: "Task_3",
    type: "task",
    progress: 0,
    dependencies: ["Task_2"],
    styles: { progressColor: "#10b981", progressSelectedColor: "#047857" },
  },
  {
    start: addDays(today, 28),
    end: addDays(today, 35),
    name: "🧪 QA & Testing",
    id: "Task_4",
    type: "task",
    progress: 0,
    dependencies: ["Task_3"],
    styles: { progressColor: "#ec4899", progressSelectedColor: "#db2777" },
  },
  {
    start: addDays(today, 36),
    end: addDays(today, 40),
    name: "🚀 Launch",
    id: "Task_5",
    type: "milestone",
    progress: 0,
    dependencies: ["Task_4"],
    styles: { progressColor: "#8b5cf6", progressSelectedColor: "#7c3aed" },
  },
];

export default function GanttChartPage() {
  const [view, setView] = useState(ViewMode.Week);

  const Gantt = dynamic(() => import("gantt-task-react").then((mod) => mod.Gantt), {
    ssr: false,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-8 px-4 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Heading */}
          <div className="mb-10">
            <h1 className="  text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-3">
              Project Timeline (Gantt View)
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl ">
              Visualize project phases, track progress, and align your team with a powerful Gantt chart.
            </p>
          </div>

          {/* Chart Card */}
          <div className="bg-white border shadow-xl rounded-3xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 py-3 border-b bg-gradient-to-r from-white via-indigo-50 to-white">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Tip: Scroll horizontally to view the full timeline.
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-600 font-semibold whitespace-nowrap">View Mode:</label>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                  className="border text-sm rounded-md px-3 py-1 bg-white w-full sm:w-auto"
                >
                  {Object.values(ViewMode).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gantt Table Wrapper */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px] sm:min-w-full p-2">
                <Gantt tasks={tasks} viewMode={view} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Built with <span className="text-indigo-600 font-semibold">gantt-task-react</span> for high-quality visual planning.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
