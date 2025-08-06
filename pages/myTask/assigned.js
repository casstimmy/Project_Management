// pages/assigned-to-me.js
import { useEffect, useState } from "react";
import PageLayout from "@/components/MainLayout/PageLayout";
import Link from "next/link";

export default function AssignedToMe() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch("/api/tasks?assignedTo=me");
      const data = await res.json();
      setTasks(data);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  return (
    <PageLayout>
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
    </PageLayout>
  );
}
