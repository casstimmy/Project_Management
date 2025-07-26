import Layout from "@/components/Nav";

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

const statusColors = {
  "Completed": "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Not Started": "bg-gray-100 text-gray-700",
};

export default function Projects() {
  return (
    <Layout>
      <div className="min-h-screen p-8 bg-[#f9fafb]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Projects Overview</h1>
          <p className="text-sm text-gray-500">Track all your projects in one place.</p>
        </div>

        <div className="overflow-x-auto rounded-lg shadow ring-1 ring-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Project Name
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  End Date
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project, index) => (
                <tr key={project.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{project.name}</td>
                  <td className="px-6 py-4 text-gray-700">{project.owner}</td>
                  <td className="px-6 py-4 text-gray-600">{project.startDate}</td>
                  <td className="px-6 py-4 text-gray-600">{project.endDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}