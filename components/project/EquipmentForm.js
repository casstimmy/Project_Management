import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import axios from "axios";

export default function EquipmentForm({ projectId, _id, onClose, onSave }) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [condition, setCondition] = useState("Good");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveEquipment(ev) {
    ev.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    setErrorMessage("");
    setSaving(true);

    try {
      let imageUrl = preview;

    
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data.links && uploadRes.data.links.length > 0) {
          imageUrl = uploadRes.data.links[0];
        }
      }

      const equipmentData = {
        name: name.trim(),
        details,
        condition,
        imageUrl,
        checked: false,
      };

      let savedItem;
      if (_id) {
        const res = await axios.put("/api/equipment", {
          _id,
          ...equipmentData,
        });
        savedItem = res.data;
        setSuccessMessage("Equipment updated successfully!");
      } else {
        const res = await axios.post("/api/equipment", equipmentData, {
          headers: { "Content-Type": "application/json" },
        });
        savedItem = res.data;
        setSuccessMessage("Equipment added successfully!");
      }

      if (onSave) onSave(savedItem);
      if (onClose) onClose();

      setName("");
      setDetails("");
      setCondition("Good");
      setFile(null);
      setPreview("");
    } catch (error) {
      console.error("Save failed:", error.response?.data || error.message);
      setErrorMessage("Failed to save equipment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function removeImage() {
    setFile(null);
    setPreview("");
  }

  return (
    <form
      onSubmit={saveEquipment}
      className="max-w-3xl mx-auto px-6 py-8 bg-white shadow-2xl rounded-2xl transition hover:shadow-3xl"
    >
      <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">
        🛠 {_id ? "Edit Equipment" : "Add New Equipment"}
      </h2>

      {/* Grid layout */}
      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Name"
          value={name}
          setValue={setName}
          placeholder="Hammer, Drill..."
        />
        <SelectField
          label="Condition"
          value={condition}
          setValue={setCondition}
          options={[
            { value: "Good", label: "Good" },
            { value: "Needs Repair", label: "Needs Repair" },
            { value: "Replace Soon", label: "Replace Soon" },
          ]}
        />
      </div>

      {/* Details */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2">Details</label>
        <textarea
          className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Extra notes (brand, model, condition...)"
          rows={4}
        />
      </div>

      {/* Upload photo */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-3">Photo</label>
        <div className="flex items-center gap-4">
          {!preview ? (
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <Upload size={24} />
              <span className="text-xs mt-1">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }
                }}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <p className="text-red-600 mt-4 text-sm font-medium">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-green-600 mt-4 text-sm font-medium">
          {successMessage}
        </p>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving} // ✅ disable button while saving
          className={`px-6 py-2 rounded-lg shadow text-white ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transition"
          }`}
        >
          {saving ? "Saving..." : "Save"} {/* ✅ change text */}
        </button>
      </div>
    </form>
  );
}

/* --- Reusable Components --- */
function InputField({ label, value, setValue, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
      />
    </div>
  );
}

function SelectField({ label, value, setValue, options }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
