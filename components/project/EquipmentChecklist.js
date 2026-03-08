// components/project/EquipmentChecklist.js
import { useState, useEffect } from "react";
import EquipmentForm from "./EquipmentForm";
import Loader from "@/components/Loader";
import { Plus, Edit2, Trash2, CheckCircle, Circle, Wrench, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function EquipmentChecklist({ project }) {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const url = project?._id
        ? `/api/equipment?projectId=${project._id}`
        : "/api/equipment";
      const res = await fetch(url);
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [project?._id]);

  const toggleCheck = async (id, current) => {
    try {
      const res = await fetch("/api/equipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, checked: !current }),
      });
      const updated = await res.json();
      setList((prev) => prev.map((i) => (i._id === id ? updated : i)));
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this equipment item?")) return;
    try {
      const res = await fetch(`/api/equipment?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => prev.filter((i) => i._id !== id));
        toast.success("Equipment deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const checkedCount = list.filter(i => i.checked).length;
  const conditionColor = {
    "Good": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Needs Repair": "bg-amber-50 text-amber-700 border-amber-200",
    "Replace Soon": "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Equipment Checklist</h2>
          {list.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{checkedCount} of {list.length} checked</p>
          )}
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* Progress bar */}
      {list.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Completion Progress</span>
            <span className="text-gray-900 font-semibold">{Math.round((checkedCount / list.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${(checkedCount / list.length) * 100}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <Loader text="Loading equipment..." />
      ) : list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-1">No equipment added</p>
          <p className="text-sm text-gray-500 mb-4">Add equipment items to track for this project.</p>
          <button onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus size={16} /> Add First Equipment
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((item) => (
            <div key={item._id}
              className={`bg-white rounded-xl border overflow-hidden transition hover:shadow-md ${item.checked ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200"}`}
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                {item.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                )}
                {/* Condition badge overlay */}
                <span className={`absolute top-2 left-2 text-xs font-medium px-2.5 py-1 rounded-full border ${conditionColor[item.condition] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {item.condition}
                </span>
                {/* Check indicator */}
                {item.checked && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`font-semibold text-sm ${item.checked ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {item.name}
                  </h3>
                  <button onClick={() => toggleCheck(item._id, item.checked)}
                    className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 transition">
                    {item.checked ? (
                      <CheckCircle size={20} className="text-emerald-500" />
                    ) : (
                      <Circle size={20} className="text-gray-300" />
                    )}
                  </button>
                </div>

                {item.details && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.details}</p>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => { setEditingItem(item); setShowModal(true); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
            <EquipmentForm
              projectId={project?._id}
              _id={editingItem?._id}
              initialData={editingItem}
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
