// pages/tasks/personal-list.js
import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";

export default function PersonalTaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchTasks = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("/api/tasks/personal", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setTasks(data);
  } catch (err) {
    console.error("Error fetching personal tasks:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Personal Task List</h1>
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No personal tasks found.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task._id} className="border p-4 rounded bg-white shadow-sm">
                <h2 className="font-semibold">{task.name}</h2>
                <p className="text-sm text-gray-600">{task.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
