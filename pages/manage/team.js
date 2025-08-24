// pages/manage/team.js
import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Layout from "@/components/MainLayout/Layout";
import Link from "next/link";

export default function ManageTeam() {
  const [team, setTeam] = useState([
    { id: 1, name: "John Doe", role: "Plumber", type: "Worker" },
    { id: 2, name: "Jane Smith", role: "Electrician", type: "Worker" },
    { id: 3, name: "Michael Johnson", role: "Landscape Designer", type: "Specialist" },
  ]);

  const [newMember, setNewMember] = useState({ name: "", role: "", type: "Worker" });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", role: "", type: "Worker" });
  const [searchTerm, setSearchTerm] = useState("");

  // Add new member
  const handleAdd = () => {
    if (!newMember.name || !newMember.role) return;
    setTeam([...team, { id: Date.now(), ...newMember }]);
    setNewMember({ name: "", role: "", type: "Worker" });
  };

  // Delete member
  const handleDelete = (id) => {
    setTeam(team.filter((m) => m.id !== id));
  };

  // Edit member
  const handleEdit = (member) => {
    setEditId(member.id);
    setEditData(member);
  };

  const handleUpdate = () => {
    setTeam(team.map((m) => (m.id === editId ? editData : m)));
    setEditId(null);
  };

  // Filtered list
  const filteredTeam = team.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl text-blue-900 font-bold mb-6">Manage Team</h1>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <Link href="../manage/team/new"> <div className="py-2 px-6 bg-blue-600 text-white rounded-sm"> Add Team Member </div> </Link>
        </div>


        {/* Search */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg flex-1"
          />
        </div>

        {/* Team Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border-b text-left">#</th>
                <th className="p-3 border-b text-left">Name</th>
                <th className="p-3 border-b text-left">Role</th>
                <th className="p-3 border-b text-left">Type</th>
                <th className="p-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map((member, index) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">
                    {editId === member.id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      member.name
                    )}
                  </td>
                  <td className="p-3 border-b">
                    {editId === member.id ? (
                      <input
                        type="text"
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      member.role
                    )}
                  </td>
                  <td className="p-3 border-b">
                    {editId === member.id ? (
                      <select
                        value={editData.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="border p-1 rounded"
                      >
                        <option value="Worker">Worker</option>
                        <option value="Specialist">Specialist</option>
                      </select>
                    ) : (
                      member.type
                    )}
                  </td>
                  <td className="p-3 border-b flex gap-2">
                    {editId === member.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTeam.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
