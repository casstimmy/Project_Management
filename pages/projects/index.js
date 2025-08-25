// pages/projects/index.js
import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/MainLayout/Layout";
import { Progress } from "@/components/ui/progress"; // optional if using shadcn/ui
import Loader from "@/components/Loader";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Projects</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-gray-600">No projects found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <Link
                key={p._id}
                href={`/projects/${p._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg p-5 border transition flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{p.title}</h2>
                  <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                    {p.purpose || "—"}
                  </p>
                </div>

                {/* Progress Example */}
                {p.progress && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Progress: {p.progress.completed}/{p.progress.total}
                    </p>
                    <Progress
                      value={(p.progress.completed / p.progress.total) * 100}
                    />
                  </div>
                )}

                {/* Budget Example */}
                {p.budget && (
                  <div className="mt-3 text-xs text-gray-500">
                    Budget: ₦{p.budget.actual} / ₦{p.budget.planned}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
