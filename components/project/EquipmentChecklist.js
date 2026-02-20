// components/project/EquipmentChecklist.js
import { useState, useEffect } from "react";
import EquipmentForm from "./EquipmentForm";

export default function EquipmentChecklist({ project }) {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchList = async () => {
    try {
      const res = await fetch("/api/equipment");
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    }
  };

  useEffect(() => {
    fetchList();
  }, [project._Id]);

  const toggleCheck = async (id, current) => {
    try {
      const res = await fetch("/api/equipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, checked: !current }),
      });
      const updated = await res.json();
      setList((prev) => prev.map((i) => (i._id === id ? updated : i)));
    } catch (err) {
      console.error("Failed to toggle check:", err);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Equipment Checklist</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add Equipment
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-gray-600 text-center text-lg animate-pulse">
          No equipment added yet...
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item) => (
            <div
              key={item._id}
              className="relative bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {/* Image */}
              {item.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-64 object-contain bg-gray-100"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                  No Image
                </div>
              )}

              <div className="p-4 flex flex-col h-full">
                {/* Fancy Checkbox */}
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`text-xl font-semibold ${
                      item.checked ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item._id, item.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                </div>

                {/* Condition */}
                <span
                  className={`inline-block px-3 py-1 mb-2 rounded-full text-sm font-medium ${
                    item.condition === "Good"
                      ? "bg-green-100 text-green-800"
                      : item.condition === "Needs Repair"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.condition}
                </span>

                {/* Details */}
                {item.details && (
                  <p className="text-gray-600 text-sm mb-3 flex-1">{item.details}</p>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowModal(true);
                  }}
                  className="mt-auto self-start px-4 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              ×
            </button>
            <EquipmentForm
              projectId={project._Id}
              _id={editingItem?._id}
              onSave={(savedItem) => {
                setList((prev) => {
                  const exists = prev.find((i) => i._id === savedItem._id);
                  if (exists) return prev.map((i) => (i._id === savedItem._id ? savedItem : i));
                  return [savedItem, ...prev];
                });
              }}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
