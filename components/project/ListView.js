import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const statuses = ["todo", "inprogress", "done"];
const statusColors = {
  todo: "bg-indigo-100 text-indigo-800",
  inprogress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
};

export default function ProjectTasks({ project }) {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [date, setDate] = useState(new Date());

  const projectId = project?._id;

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  const getTasksForDate = (d) =>
    tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === d.getFullYear() &&
        taskDate.getMonth() === d.getMonth() &&
        taskDate.getDate() === d.getDate()
      );
    });

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayTasks = getTasksForDate(date);
      if (dayTasks.length > 0) {
        return (
          <div className="mt-1 flex flex-col gap-1">
            {dayTasks.map((task) => (
              <span
                key={task._id}
                className="bg-indigo-100 text-indigo-800 text-xs rounded-full px-2 py-0.5 truncate"
                title={task.name}
              >
                {task.name}
              </span>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-2xl border border-gray-100">
      {/* Title with dynamic view */}
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        List and Calendar
      </h2>{" "}
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Task List Section */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-100 to-white text-gray-800 rounded-t-2xl border-y-2 border-gray-300 p-6 ">
            <h2 className="text-lg font-semibold">Task List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Assignee", "Due Date", "Status", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className="py-3 px-6 text-left text-gray-600 font-semibold text-xs uppercase tracking-wide border-b"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => {
                  const isEditing = editingTaskId === task._id;
                  return (
                    <tr
                      key={task._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-indigo-50/40 transition`}
                    >
                      <td className="py-3 px-6 border-b">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedTask.name}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                            className="border px-2 py-1 rounded w-full focus:ring-2 focus:ring-indigo-400"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">
                            {task.name}
                          </span>
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
                            className="border px-2 py-1 rounded w-full focus:ring-2 focus:ring-indigo-400"
                          />
                        ) : (
                          task.assignee?.name || "Unassigned"
                        )}
                      </td>
                      <td className="py-3 px-6 border-b text-sm text-gray-500">
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
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            statusColors[task.status]
                          }`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-6 border-b flex gap-3">
                        {isEditing ? (
                          <>
                            <button
                              className="text-indigo-600 font-medium hover:underline"
                              onClick={() => saveTask(task._id)}
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-500 hover:underline"
                              onClick={() => setEditingTaskId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="text-indigo-600 font-medium hover:underline"
                              onClick={() => {
                                setEditingTaskId(task._id);
                                setEditedTask(task);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 font-medium hover:underline"
                              onClick={() =>
                                fetch(`/api/tasks/${task._id}`, {
                                  method: "DELETE",
                                }).then(fetchTasks)
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
        </div>

        {/* Calendar Section */}
        <div className="flex flex-col xl:flex-row gap-6 backdrop-blur-lg bg-white/80 rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* Calendar */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Calendar
            </h2>
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
              className="react-calendar border-none text-gray-700 font-medium w-full rounded-xl shadow-sm"
            />
          </div>

          {/* Daily Tasks */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-3 text-gray-800">
              {date.toDateString()}
            </h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
              {getTasksForDate(date).length > 0 ? (
                getTasksForDate(date).map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition"
                  >
                    <span className="font-medium text-gray-800">
                      {task.name}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        statusColors[task.status]
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center italic">
                  No tasks for this day
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Calendar Styling Overrides */}
      <style jsx global>{`
        .react-calendar__tile--now {
          background: #e0e7ff !important;
          border-radius: 50%;
        }
        .react-calendar__tile--active {
          background: #6366f1 !important;
          color: white !important;
          border-radius: 50%;
        }
        .react-calendar__tile:hover {
          background: #dbeafe !important;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .react-calendar__month-view__weekdays {
          font-weight: 600;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}
