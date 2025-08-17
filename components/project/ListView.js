import { useState, useEffect } from "react";

const statuses = ["todo", "inprogress", "done"];
const statusColors = {
  todo: "bg-indigo-100 text-indigo-800",
  inprogress: "bg-indigo-200 text-indigo-900",
  done: "bg-indigo-300 text-indigo-900",
};

export default function ListView({ project, onTaskClick, onDeleteTask }) {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});

  const fetchTasks = async () => {
    if (!project?._id) return;
    try {
      const res = await fetch(`/api/tasks?projectId=${project._id}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [project]);

  const handleChange = (field, value) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const saveTask = async (taskId) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedTask),
      });
      setEditingTaskId(null);
      setEditedTask({});
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Tasks List
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-10 text-lg">
          No tasks available.
        </p>
      ) : (
        <>
          {/* Table for medium and large screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse shadow rounded-xl">
              <thead className="bg-gradient-to-r from-indigo-200 to-purple-200">
                <tr>
                  {["Name", "Assignee", "Due Date", "Status", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className="py-3 px-6 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const isEditing = editingTaskId === task._id;
                  return (
                    <tr
                      key={task._id}
                      className="bg-white hover:shadow-lg transition-shadow duration-300"
                    >
                      <td className="py-3 px-6 border-b text-gray-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedTask.name}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          task.name
                        )}
                      </td>
                      <td className="py-3 px-6 border-b text-gray-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedTask.assignee?.name || ""}
                            onChange={(e) =>
                              handleChange("assignee", { name: e.target.value })
                            }
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          task.assignee?.name || "Unassigned"
                        )}
                      </td>
                      <td className="py-3 px-6 border-b text-gray-500 text-sm">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-6 border-b">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task._id, e.target.value)
                          }
                          className={`px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusColors[task.status]}`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-6 border-b flex gap-2 whitespace-nowrap">
                        {isEditing ? (
                          <>
                            <button
                              className="text-indigo-700 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 text-xs font-semibold transition"
                              onClick={() => saveTask(task._id)}
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-600 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 text-xs font-semibold transition"
                              onClick={() => setEditingTaskId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="text-indigo-700 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 text-xs font-semibold transition"
                              onClick={() => {
                                setEditingTaskId(task._id);
                                setEditedTask(task);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-700 bg-red-50 px-2 py-1 rounded hover:bg-red-100 text-xs font-semibold transition"
                              onClick={() =>
                                onDeleteTask(task._id).then(fetchTasks)
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards for small screens */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {tasks.map((task) => {
              const isEditing = editingTaskId === task._id;
              return (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedTask.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        task.name
                      )}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]} transition-all duration-300`}
                    >
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className="bg-transparent text-sm font-medium focus:outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>

                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Assignee: </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTask.assignee?.name || ""}
                        onChange={(e) =>
                          handleChange("assignee", { name: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      task.assignee?.name || "Unassigned"
                    )}
                  </p>

                  <p className="text-gray-500 mt-1 text-sm">
                    <span className="font-medium">Due: </span>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <div className="flex gap-2 mt-4 flex-wrap">
                    {isEditing ? (
                      <>
                        <button
                          className="flex-1 text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 text-sm font-semibold transition"
                          onClick={() => saveTask(task._id)}
                        >
                          Save
                        </button>
                        <button
                          className="flex-1 text-gray-700 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm font-semibold transition"
                          onClick={() => setEditingTaskId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="flex-1 text-indigo-700 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 text-sm font-semibold transition"
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setEditedTask(task);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 text-red-700 bg-red-50 px-3 py-1 rounded hover:bg-red-100 text-sm font-semibold transition"
                          onClick={() =>
                            onDeleteTask(task._id).then(fetchTasks)
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
