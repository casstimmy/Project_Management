import Layout from "@/components/Nav";
import { FaCheckCircle, FaHourglassHalf, FaRegCircle } from "react-icons/fa";

const projects = [
  {
    id: 1,
    name: "Ibile Phase 1 Expansion",
    description: "Expanding infrastructure and resources for phase 1 rollout.",
    status: "Completed",
    owner: "Ayo Ayoola",
    startDate: "2024-01-10",
    endDate: "2024-06-15",
  },
  {
    id: 2,
    name: "Smart Inventory System",
    description: "Developing a smart POS + inventory system with analytics.",
    status: "In Progress",
    owner: "Paul Johnson",
    startDate: "2025-04-01",
    endDate: "2025-12-20",
  },
  {
    id: 3,
    name: "Facility Maintenance Scheduler",
    description: "Create auto-reminder system for recurring facility tasks.",
    status: "Not Started",
    owner: "Esther Bello",
    startDate: "2025-09-01",
    endDate: "2026-01-15",
  },
  {
    id: 4,
    name: "Bread Business Digitization",
    description: "Digitize production, expenses, and sales tracking system.",
    status: "In Progress",
    owner: "Ben Okoro",
    startDate: "2025-05-05",
    endDate: "2025-11-30",
  },
  {
    id: 5,
    name: "Cross-location Procurement Sync",
    description: "Integrate procurement tracking across all Ibile stores.",
    status: "Completed",
    owner: "Jonna Martins",
    startDate: "2024-10-01",
    endDate: "2025-02-28",
  },
  {
    id: 6,
    name: "Customer Loyalty Mobile App",
    description: "Design a mobile app for Ibile loyalty and feedback tracking.",
    status: "Not Started",
    owner: "Tunde Folarin",
    startDate: "2025-10-10",
    endDate: "2026-04-30",
  },
];

const statusStyles = {
  "Completed": {
    color: "bg-green-100 text-green-700",
    icon: <FaCheckCircle className="mr-1" />,
  },
  "In Progress": {
    color: "bg-yellow-100 text-yellow-700",
    icon: <FaHourglassHalf className="mr-1" />,
  },
  "Not Started": {
    color: "bg-gray-100 text-gray-600",
    icon: <FaRegCircle className="mr-1" />,
  },
};

export default function Projects() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-10 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Projects Overview</h1>
            <p className="text-sm text-gray-500">
              Easily track all your active and completed projects with real-time visibility.
            </p>
          </div>

          <div className="overflow-x-auto border rounded-2xl shadow-xl ring-1 ring-gray-200 bg-white/70 backdrop-blur-md">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-blue-50 text-blue-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">#</th>
                  <th className="px-6 py-3 text-left font-semibold">Project</th>
                  <th className="px-6 py-3 text-left font-semibold">Owner</th>
                  <th className="px-6 py-3 text-left font-semibold">Start</th>
                  <th className="px-6 py-3 text-left font-semibold">End</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project, index) => (
                  <tr key={project.id} className="hover:bg-blue-50/20 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex flex-col">
                        <span>{project.name}</span>
                        <span
                          title={project.description}
                          className="text-xs text-gray-500 truncate max-w-xs"
                        >
                          {project.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{project.owner}</td>
                    <td className="px-6 py-4 text-gray-600">{project.startDate}</td>
                    <td className="px-6 py-4 text-gray-600">{project.endDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[project.status].color}`}
                      >
                        {statusStyles[project.status].icon}
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Optional: Summary Stats */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white border rounded-xl shadow p-4">
              <p className="text-xl font-bold text-blue-700">
                {projects.length}
              </p>
              <p className="text-sm text-gray-500">Total Projects</p>
            </div>
            <div className="bg-white border rounded-xl shadow p-4">
              <p className="text-xl font-bold text-yellow-600">
                {projects.filter(p => p.status === "In Progress").length}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="bg-white border rounded-xl shadow p-4">
              <p className="text-xl font-bold text-green-600">
                {projects.filter(p => p.status === "Completed").length}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
