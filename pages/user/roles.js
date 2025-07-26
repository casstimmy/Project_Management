import { useState } from "react";
import Layout from "@/components/Layout";
import { Plus } from "lucide-react";


export default function Roles() {
  const [roles, setRoles] = useState([
    { id: 1, name: "Admin", description: "Full access to all features" },
    { id: 2, name: "Manager", description: "Manage users and inventory" },
    { id: 3, name: "Staff", description: "Limited access to sales only" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", description: "" });

  const handleEdit = (role) => {
    setForm(role);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = () => {
    if (form.id) {
      setRoles((prev) =>
        prev.map((r) => (r.id === form.id ? { ...r, ...form } : r))
      );
    } else {
      setRoles((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setForm({ id: null, name: "", description: "" });
  };

  return (
    <Layout>
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-8">
  <div className="w-full max-w-3xl bg-white/80 border backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8">
     <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                👥 User Roles
              </h1>
              <p className="text-sm text-gray-500">
                Create, update and manage roles and permissions.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl overflow-hidden border border-gray-200">
  <thead>
    <tr className="bg-gray-100 text-left text-sm text-gray-600">
      <th className="py-3 px-6 font-medium">Role</th>
      <th className="py-3 px-6 font-medium">Description</th>
      <th className="py-3 px-6 text-right font-medium">Actions</th>
    </tr>
  </thead>
  <tbody>
    {roles.map((role) => (
      <tr key={role.id} className="border-t hover:bg-blue-50 transition">
        <td className="py-3 px-6 text-gray-800 font-medium">{role.name}</td>
        <td className="py-3 px-6 text-gray-600">{role.description}</td>
        <td className="py-3 px-6 text-right space-x-4">
          <button
            onClick={() => handleEdit(role)}
            className="inline-flex items-center border bg-blue-400 px-3 py-2 rounded-lg text-sm text-white hover:bg-white hover:text-blue-600 font-medium transition"
          >

            Edit
          </button>
          <button
            onClick={() => handleDelete(role.id)}
            className="inline-flex items-center border bg-red-400 px-3 py-2 rounded-lg text-sm text-white hover:bg-white hover:text-red-600 font-medium transition"
          >

            Delete
          </button>
        </td>
      </tr>
    ))}
    {roles.length === 0 && (
      <tr>
        <td colSpan="3" className="py-5 text-center text-gray-400 italic">
          No roles added yet.
        </td>
      </tr>
    )}
  </tbody>
</table>

          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
       <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {form.id ? "Edit Role" : "Add New Role"}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Supervisor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Briefly describe the role..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setForm({ id: null, name: "", description: "" });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {form.id ? "Update Role" : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
