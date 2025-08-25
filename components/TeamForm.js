// components/TeamForm.js
import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Trash2, Upload } from "lucide-react";
import Loader from "./Loader";

export default function TeamForm({ _id }) {
  const router = useRouter();

  // states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("Worker");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(!!_id); // if editing, start in loading mode
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // fetch member if editing
  useEffect(() => {
    async function fetchMember() {
      if (_id) {
        try {
          const res = await axios.get(`/api/manage/team?id=${_id}`);
          const member = res.data;

          setName(member.name || "");
          setRole(member.role || "");
          setType(member.type || "Worker");
          setPhone(member.phone || "");
          setNotes(member.notes || "");
          setImage(member.image || "");
        } catch (error) {
          console.error("Failed to fetch member:", error);
          setErrorMessage("Failed to load member details.");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchMember();
  }, [_id]);

  // save member
  async function saveTeamMember(ev) {
    ev.preventDefault();

    if (!name || !role) {
      setErrorMessage("Name and Role are required.");
      return;
    }
    setErrorMessage("");

    let imageUrl = image;

    // if new file, upload first
    if (file) {
      try {
        const data = new FormData();
        data.append("file", file);

        const res = await axios.post("/api/upload", data);
        imageUrl = res.data.links?.[0];
      } catch (error) {
        console.error("Image upload failed:", error);
        setErrorMessage("Failed to upload image. Please try again.");
        return;
      }
    }

    const data = { name, role, type, phone, notes, image: imageUrl };

    try {
      if (_id) {
        await axios.put("/api/manage/team", { ...data, _id });
      } else {
        await axios.post("/api/manage/team", data);
        setSuccessMessage("Team member added successfully!");
      }
      router.push("/manage/team");
    } catch (error) {
      console.error("Error saving team member:", error);
      setErrorMessage("Failed to save team member. Please try again.");
    }
  }

  function removeImage() {
    setImage("");
    setFile(null);
  }

  // ⏳ Wait until loading is done before rendering form
  if (loading) {
    return (
     <Loader />
    );
  }

  return (
    <form
      onSubmit={saveTeamMember}
      className="max-w-3xl mx-auto px-6 py-8 bg-white shadow-2xl rounded-2xl transition hover:shadow-3xl"
    >
      <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">
        ✨ { _id ? "Edit Team Member" : "Add New Team Member" }
      </h2>

      {/* Grid layout */}
      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Full Name"
          value={name}
          setValue={setName}
          placeholder="Enter member name"
        />
        <InputField
          label="Role"
          value={role}
          setValue={setRole}
          placeholder="Enter role (Plumber, Electrician...)"
        />

        <SelectField
          label="Type"
          value={type}
          setValue={setType}
          options={[
            { value: "Worker", label: "Worker" },
            { value: "Specialist", label: "Specialist" },
          ]}
        />
        <InputField
          label="Phone"
          value={phone}
          setValue={setPhone}
          placeholder="Enter phone number"
        />
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2">Notes</label>
        <textarea
          className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Extra notes (skills, availability...)"
          rows={4}
        />
      </div>

      {/* Upload photo */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-3">
          Profile Photo
        </label>
        <div className="flex items-center gap-4">
          {!image && !file ? (
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <Upload size={24} />
              <span className="text-xs mt-1">Upload</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md group">
              <img
                src={image || URL.createObjectURL(file)}
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
          onClick={() => router.push("/manage/team")}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:scale-105 transition"
        >
          Save
        </button>
      </div>
    </form>
  );
}

/* Reusable Inputs */
function InputField({ label, value, setValue, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        type={type}
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, value, setValue, options }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
