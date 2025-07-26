import Layout from "@/components/Layout";
import { useState } from "react";
import {
  BarChart2,
  PieChart,
  Activity,
  Users,
  Calendar,
} from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register chart modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

// Bar Chart Data
const barData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Completed Tasks",
      data: [12, 19, 8, 15, 10, 20],
      backgroundColor: "#3b82f6",
      borderRadius: 8,
    },
  ],
};

// Pie Chart Data
const pieData = {
  labels: ["Design", "Development", "QA", "Deployment"],
  datasets: [
    {
      data: [30, 40, 15, 15],
      backgroundColor: ["#facc15", "#22c55e", "#3b82f6", "#ef4444"],
      borderWidth: 1,
    },
  ],
};

const team = [
  { name: "Sarah Johnson", role: "Designer", image: "/images/staff1.jpg" },
  { name: "James Smith", role: "Developer", image: "/images/staff2.jpg" },
  { name: "Linda Lee", role: "QA Lead", image: "/images/staff3.jpg" },
  { name: "Michael Brown", role: "Project Manager", image: "/images/staff4.jpg" },
];

const assignments = [
  { task: "Homepage UI", assignee: "Sarah", status: "Completed" },
  { task: "API Integration", assignee: "James", status: "In Progress" },
  { task: "Bug Testing", assignee: "Linda", status: "Completed" },
  { task: "Client Meeting", assignee: "Michael", status: "Scheduled" },
];

export default function Dashboard() {
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (name) => {
    setImgErrors((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gradient-to-tr from-[#f8fafc] to-[#eef2f7]">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Project Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Users, color: "text-blue-600", label: "Team Members", value: 24 },
            { icon: Activity, color: "text-green-600", label: "Active Projects", value: 8 },
            { icon: Calendar, color: "text-yellow-500", label: "Deadlines", value: 5 },
            { icon: BarChart2, color: "text-red-500", label: "Tasks Completed", value: 142 },
          ].map(({ icon: Icon, color, label, value }, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl rounded-2xl p-5 transition duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 border ${color}`}>
                  <Icon className={color} size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[
            {
              title: "📊 Tasks Over Time",
              chart: <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />,
            },
            {
              title: "📈 Project Allocation",
              chart: <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "right" } } }} />,
            },
          ].map(({ title, chart }, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
              {chart}
            </div>
          ))}
        </div>

        {/* Team & Assignments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team */}
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">👥 Team Members</h2>
            <div className="grid grid-cols-2 gap-4">
              {team.map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  {!imgErrors[member.name] ? (
                    <Image
                      src={member.image}
                      alt={`Photo of ${member.name}`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10 shadow-sm"
                      onError={() => handleImgError(member.name)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📌 Work Assignments</h2>
            <ul className="space-y-3">
              {assignments.map(({ task, assignee, status }) => (
                <li
                  key={task}
                  className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{task}</p>
                    <p className="text-xs text-gray-500">Assigned to {assignee}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
