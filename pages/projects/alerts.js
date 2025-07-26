import Layout from "@/components/Layout";
import { Bell, CalendarClock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Alerts_Reminders() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Design Review Meeting",
      description: "Scheduled for July 30 at 3:00 PM",
      type: "reminder",
      status: "active",
    },
    {
      id: 2,
      title: "Project Phase 1 Deadline",
      description: "Due by August 10",
      type: "alert",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Team Feedback Required",
      description: "Submit feedback by August 1",
      type: "reminder",
      status: "completed",
    },
  ]);

  return (
    <Layout>
      <div className="bg-gradient-to-br from-[#f9fafb] to-white min-h-screen py-10 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
            Alerts & Reminders
          </h1>
          <p className="text-lg text-gray-600">
            Stay on top of your projects with smart alerts and reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                {item.type === "reminder" ? (
                  <CalendarClock className="text-blue-500 mr-3" />
                ) : (
                  <AlertCircle className="text-red-500 mr-3" />
                )}
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700"
                      : item.status === "upcoming"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                {item.status === "completed" && <CheckCircle2 className="text-green-500" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-xl font-semibold shadow-md">
            + Create New Alert
          </button>
          <p className="text-sm text-gray-400 mt-2">
            Customize alerts to track tasks, deadlines, and project milestones.
          </p>
        </div>
      </div>
    </Layout>
  );
}
