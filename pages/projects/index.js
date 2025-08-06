// pages/projects/index.js
import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/MainLayout/PageLayout";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Projects</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Link
                key={p._id}
                href={`/projects/${p._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg p-4 border"
              >
                <h2 className="text-xl font-semibold">{p.title}</h2>
                <p className="text-gray-600 mt-2">{p.purpose?.slice(0, 80) || "—"}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
