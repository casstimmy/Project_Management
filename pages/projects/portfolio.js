import Layout from "@/components/Layout";
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  KanbanSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const projectProgressData = [
  { month: "Jan", projects: 3 },
  { month: "Feb", projects: 5 },
  { month: "Mar", projects: 4 },
  { month: "Apr", projects: 6 },
  { month: "May", projects: 8 },
  { month: "Jun", projects: 7 },
];

const productivityData = [
  { team: "Alpha", tasks: 120 },
  { team: "Beta", tasks: 98 },
  { team: "Gamma", tasks: 135 },
  { team: "Delta", tasks: 110 },
];

export default function Portfolio_Dashboards() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Portfolio Dashboard</h1>
          <p className="text-lg text-gray-600 mb-10">
            Visualize and track project portfolios, performance metrics, and team productivity from one place.
          </p>

          {/* Overview Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Projects</h2>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <KanbanSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Milestones</h2>
                  <p className="text-2xl font-bold text-green-600">27</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Active Teams</h2>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                </div>
                <PieIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Completion Rate</h2>
                  <p className="text-2xl font-bold text-yellow-600">83%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white p-8 rounded-2xl shadow mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Progress Line Chart */}
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Project Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectProgressData}>
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="projects" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Productivity Bar Chart */}
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Team Productivity Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="team" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tasks" fill="#a855f7" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Projects */}
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Projects</h2>
            <ul className="divide-y divide-gray-100">
              <li className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-700">Website Redesign</p>
                  <p className="text-sm text-gray-500">Launch date: August 15, 2025</p>
                </div>
                <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">Design</span>
              </li>
              <li className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-700">Mobile App MVP</p>
                  <p className="text-sm text-gray-500">Launch date: September 2, 2025</p>
                </div>
                <span className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full">Development</span>
              </li>
              <li className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-700">Internal Tools Overhaul</p>
                  <p className="text-sm text-gray-500">Launch date: October 10, 2025</p>
                </div>
                <span className="text-sm bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">Infrastructure</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
