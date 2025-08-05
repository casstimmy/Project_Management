// components/Modal/ProjectModal.js
import { useState } from "react";
import { X, PlusCircle } from "lucide-react";

export default function ProjectModal({ closeModal, activeSpace }) {
  const [objectives, setObjectives] = useState([""]);
  const [stakeholders, setStakeholders] = useState([
    { name: "", role: "", contact: "" },
  ]);
  const [responsibilities, setResponsibilities] = useState([
    { role: "", responsibility: "" },
  ]);

  const addObjective = () => setObjectives([...objectives, ""]);
  const addStakeholder = () =>
    setStakeholders([...stakeholders, { name: "", role: "", contact: "" }]);
  const addResponsibility = () =>
    setResponsibilities([...responsibilities, { role: "", responsibility: "" }]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
        >
          <X size={24} />
        </button>
        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Add New Project to <span className="text-indigo-600">{activeSpace}</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // submit logic here
              closeModal();
            }}
            className="space-y-6"
          >
            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter project title"
              />
            </div>

            {/* Purpose & Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Purpose & Justification
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Why is this project being undertaken?"
              ></textarea>
            </div>

            {/* Project Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Objectives
              </label>
              <div className="space-y-2">
                {objectives.map((objective, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Objective ${idx + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={addObjective}
                  className="text-indigo-600 text-sm font-medium flex items-center gap-1"
                >
                  <PlusCircle size={16} /> Add Objective
                </button>
              </div>
            </div>

            {/* Project Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Scope
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="What's in scope and what's out of scope?"
              ></textarea>
            </div>

            {/* Key Stakeholders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Stakeholders
              </label>
              {stakeholders.map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"
                >
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Contact Info"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addStakeholder}
                className="text-indigo-600 text-sm font-medium flex items-center gap-1"
              >
                <PlusCircle size={16} /> Add Stakeholder
              </button>
            </div>

            {/* Roles & Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles & Responsibilities
              </label>
              {responsibilities.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Role (e.g. Contractor)"
                  />
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Responsibility"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addResponsibility}
                className="text-indigo-600 text-sm font-medium flex items-center gap-1"
              >
                <PlusCircle size={16} /> Add Responsibility
              </button>
            </div>

            {/* Budget Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Summary
              </label>
              {["Labor", "Materials", "Contingency", "Total"].map((cat) => (
                <div key={cat} className="mb-2">
                  <label className="text-sm font-semibold">{cat}</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    placeholder={`$ Amount for ${cat}`}
                  />
                </div>
              ))}
            </div>

            {/* Risks & Assumptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risks & Assumptions
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-md px-4 py-2 mb-2"
                placeholder="Major Risks (e.g., contractor delays, weather)..."
              ></textarea>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder="Key Assumptions (e.g., permits approved on time)..."
              ></textarea>
            </div>

            {/* Approval Signatures */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Signatures
              </label>
              {["Project Sponsor", "Project Manager", "Other Stakeholder"].map((person) => (
                <div key={person} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm hover:bg-indigo-700"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
