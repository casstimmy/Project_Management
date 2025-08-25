import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Search, User } from "lucide-react";
import Layout from "@/components/MainLayout/Layout";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";

export default function ManageTeam() {
  const [team, setTeam] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await axios.get("/api/manage/team");
      setTeam(res.data);
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(id) {
    router.push(`/manage/team/edit/${id}`);
  }

  function handleDelete(id) {
    router.push(`/manage/team/delete/${id}`);
  }

  const filteredTeam = team.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">👥 Manage Team</h1>
          <Link href="/manage/team/new">
            <div className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md transition">
              <Plus size={18} />
              Add Member
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search team by name, role or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeam.map((member) => (
              <div
                key={member._id}
                className="bg-white shadow-lg hover:shadow-xl transition rounded-2xl p-5 flex flex-col items-center text-center relative"
              >
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 shadow-inner mb-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={32} />
                    </div>
                  )}
                </div>

                {/* Name & role */}
                <h3 className="text-lg font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium">{member.role}</p>
                <span className="mt-1 text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                  {member.type}
                </span>

                {/* Actions */}
                <div className="flex gap-4 mt-5">
                  <button
                    onClick={() => handleEdit(member._id)}
                    className="p-2 rounded-full bg-gray-100 text-blue-600 hover:bg-blue-50 hover:scale-110 transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 rounded-full bg-gray-100 text-red-600 hover:bg-red-50 hover:scale-110 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* No results */}
            {filteredTeam.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                <p className="text-lg">No team members found 🚫</p>
                <Link href="/manage/team/new">
                  <span className="text-blue-600 underline cursor-pointer">
                    Add your first member
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
