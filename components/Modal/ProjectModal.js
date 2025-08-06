import { useState } from "react";
import { X, PlusCircle } from "lucide-react";

export default function ProjectModal({
  closeModal,
  activeSpace,
  allSpaces,
  onProjectCreated,
}) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [scope, setScope] = useState("");
  const [risks, setRisks] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [objectives, setObjectives] = useState([""]);
  const [stakeholders, setStakeholders] = useState([
    { name: "", role: "", contact: "" },
  ]);
  const [responsibilities, setResponsibilities] = useState([
    { role: "", responsibility: "" },
  ]);

  const [budget, setBudget] = useState({
    Labor: "",
    Materials: "",
    Contingency: "",
    Total: "",
  });

  const [approvals, setApprovals] = useState([
    { name: "", role: "", date: "" },
    { name: "", role: "", date: "" },
    { name: "", role: "", date: "" },
  ]);

  const addObjective = () => setObjectives([...objectives, ""]);
  const addStakeholder = () =>
    setStakeholders([...stakeholders, { name: "", role: "", contact: "" }]);
  const addResponsibility = () =>
    setResponsibilities([
      ...responsibilities,
      { role: "", responsibility: "" },
    ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const space = allSpaces.find((s) => s.name === activeSpace);
    const spaceId = space?._id;

    if (!spaceId) {
      alert("Invalid space selected.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          title,
          purpose,
          scope,
          risks,
          assumptions,
          objectives: objectives.map((text) => ({ text })),
          stakeholders,
          responsibilities,
          budget: Object.entries(budget).map(([category, amount]) => ({
            category,
            amount: parseFloat(amount) || 0,
          })),
          approvals: approvals.map((a) => ({
            name: a.name,
            role: a.role,
            date: a.date ? new Date(a.date) : null,
          })),
        }),
      });

      if (!res.ok) throw new Error("Error saving project");

      const newProject = await res.json();
      window.location.href = `/projects/${newProject._id}`; // Redirect to project page
    } catch (err) {
      console.error(err);
      alert("Something went wrong saving the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Add New Project to{" "}
            <span className="text-indigo-600">{activeSpace}</span>
          </h3>

          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
              }
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter project title"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Purpose & Justification
              </label>
              <textarea
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Why is this project being undertaken?"
              />
            </div>

            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Objectives
              </label>
              <div className="space-y-2">
                {objectives.map((objective, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={objective}
                    onChange={(e) =>
                      setObjectives(
                        objectives.map((o, i) =>
                          i === idx ? e.target.value : o
                        )
                      )
                    }
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

            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Scope
              </label>
              <textarea
                rows={3}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="What's in scope and what's out of scope?"
              />
            </div>

            {/* Stakeholders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Stakeholders
              </label>
              {stakeholders.map((s, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"
                >
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) =>
                      setStakeholders(
                        stakeholders.map((st, i) =>
                          i === idx ? { ...st, name: e.target.value } : st
                        )
                      )
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={s.role}
                    onChange={(e) =>
                      setStakeholders(
                        stakeholders.map((st, i) =>
                          i === idx ? { ...st, role: e.target.value } : st
                        )
                      )
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={s.contact}
                    onChange={(e) =>
                      setStakeholders(
                        stakeholders.map((st, i) =>
                          i === idx ? { ...st, contact: e.target.value } : st
                        )
                      )
                    }
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

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles & Responsibilities
              </label>
              {responsibilities.map((r, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2"
                >
                  <input
                    type="text"
                    value={r.role}
                    onChange={(e) =>
                      setResponsibilities(
                        responsibilities.map((res, i) =>
                          i === idx ? { ...res, role: e.target.value } : res
                        )
                      )
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={r.responsibility}
                    onChange={(e) =>
                      setResponsibilities(
                        responsibilities.map((res, i) =>
                          i === idx
                            ? { ...res, responsibility: e.target.value }
                            : res
                        )
                      )
                    }
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

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Summary
              </label>
              {["Labor", "Materials", "Contingency", "Total"].map((cat) => (
                <div key={cat} className="mb-2">
                  <label className="text-sm font-semibold">{cat}</label>
                  <input
                    type="number"
                    value={budget[cat]}
                    onChange={(e) =>
                      setBudget({ ...budget, [cat]: e.target.value })
                    }
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
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 mb-2"
                placeholder="Major Risks..."
              />
              <textarea
                rows={3}
                value={assumptions}
                onChange={(e) => setAssumptions(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder="Key Assumptions..."
              />
            </div>

            {/* Approvals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Signatures
              </label>
              {approvals.map((a, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"
                >
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) =>
                      setApprovals(
                        approvals.map((appr, i) =>
                          i === idx ? { ...appr, name: e.target.value } : appr
                        )
                      )
                    }
                    placeholder="Name"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    value={a.role}
                    onChange={(e) =>
                      setApprovals(
                        approvals.map((appr, i) =>
                          i === idx ? { ...appr, role: e.target.value } : appr
                        )
                      )
                    }
                    placeholder="Role"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="date"
                    value={a.date}
                    onChange={(e) =>
                      setApprovals(
                        approvals.map((appr, i) =>
                          i === idx ? { ...appr, date: e.target.value } : appr
                        )
                      )
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSubmitting ? "Saving Project..." : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
