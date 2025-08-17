// pages/assigned-to-me.js
import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Link from "next/link";

export default function AssignedToMe() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks?assignedTo=me");
      const data = await res.json();

      // Ensure tasks is an array
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  fetchTasks();
}, []);


  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Tasks Assigned to Me</h1>
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks assigned to you.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task._id} className="border rounded p-3 bg-white shadow">
                <Link href={`/projects/${task.projectId}`} className="text-lg font-semibold text-indigo-600 hover:underline">
                  {task.name}
                </Link>
                <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
