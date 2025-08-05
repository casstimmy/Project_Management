import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import {
  ClipboardList,
  UserCheck,
  ListTodo,
  UserCircle,
  Briefcase,
  CalendarDays,
  Clock,
} from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HomePage() {
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay("Morning");
    } else if (hour < 18) {
      setTimeOfDay("Afternoon");
    } else {
      setTimeOfDay("Evening");
    }
  }, []);

  const chartData = [
    { name: "Mon", tasks: 3 },
    { name: "Tue", tasks: 4 },
    { name: "Wed", tasks: 2 },
    { name: "Thu", tasks: 5 },
    { name: "Fri", tasks: 1 },
    { name: "Sat", tasks: 3 },
    { name: "Sun", tasks: 0 },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-white p-4 md:p-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Good {timeOfDay}, Ayo!
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            Here&apos;s your workspace overview.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard icon={<ClipboardList />} title="Priorities" value="5 Tasks" />
          <DashboardCard icon={<UserCheck />} title="Assigned Comments" value="3 Replies" />
          <DashboardCard icon={<ListTodo />} title="Personal List" value="12 Items" />
          <DashboardCard icon={<UserCircle />} title="Assigned to Me" value="7 Tasks" />
          <DashboardCard icon={<Briefcase />} title="My Work" value="Ongoing" />
          <DashboardCard icon={<CalendarDays />} title="Agenda" value="2 Meetings" />
          <DashboardCard icon={<Clock />} title="Recents" value="4 Updated" />
        </div>

        {/* Weekly Overview Chart */}
        <div className="mt-10 bg-gray-100 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Overview
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function DashboardCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 border border-gray-200">
      <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
