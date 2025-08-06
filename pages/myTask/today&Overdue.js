// pages/tasks/today-overdue.js
import { useEffect, useState } from "react";
import PageLayout from "@/components/MainLayout/PageLayout";

export default function TodayOverdueTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/today-overdue");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/tasks/today-overdue", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else {
      console.error("Error loading tasks");
    }
  };

  fetchTasks();
}, []);



  return (
    <PageLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Today & Overdue Tasks</h1>
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks for today or overdue.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task._id} className="border p-4 rounded bg-white shadow-sm">
                <h2 className="font-semibold">{task.name}</h2>
                <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">{task.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}