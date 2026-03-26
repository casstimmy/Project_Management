import { useState, useEffect, useMemo, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddTaskModal from "../Modal/AddTaskModal";
import { formatCurrency } from "@/lib/currency";

const statuses = ["todo", "inprogress", "done"];
const statusLabels = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
};
const statusColors = {
  todo: "bg-indigo-100 text-indigo-800",
  inprogress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
};

export default function BoardView({ project, onTaskClick, onDeleteTask, onAddTask }) {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("todo");
  const [open, setOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!project?._id) return;
    try {
      const res = await fetch(`/api/tasks?projectId=${project._id}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  }, [project?._id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    statuses.forEach((status) => {
      grouped[status] = tasks.filter((t) => t.status === status);
    });
    return grouped;
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const task = tasks.find((t) => t._id.toString() === draggableId);
    if (!task) return;

    const updatedTask = { ...task, status: destination.droppableId };
    setTasks((prev) => prev.map((t) => (t._id === task._id ? updatedTask : t)));

    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedTask.status }),
      });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const renderProjectInfo = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 focus:outline-none transition"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          {project.purpose && <p className="text-sm text-gray-500 mt-0.5">{project.purpose}</p>}
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲ Hide Details" : "▼ Show Details"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-4">
          {project.scope && (
            <div className="pt-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scope</span>
              <p className="text-sm text-gray-700 mt-1">{project.scope}</p>
            </div>
          )}
          {project.objectives?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Objectives</span>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-0.5">
                {project.objectives.map((o, i) => <li key={i}>{o.text}</li>)}
              </ul>
            </div>
          )}
          {project.stakeholders?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stakeholders</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {project.stakeholders.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.role}{s.contact ? ` • ${s.contact}` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {project.responsibilities?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsibilities</span>
              <div className="mt-1 space-y-1">
                {project.responsibilities.map((r, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-medium text-gray-800">{r.role}:</span>
                    <span className="text-gray-600">{r.responsibility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {project.budget?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {project.budget.map((b, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {b.category}: {formatCurrency(Number(b.amount || 0))}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.risks && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risks</span>
              <p className="text-sm text-gray-700 mt-1">{project.risks}</p>
            </div>
          )}
          {project.assumptions && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assumptions</span>
              <p className="text-sm text-gray-700 mt-1">{project.assumptions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {renderProjectInfo()}

      {/* Tasks Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition"
        >
          + Add Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[250px] p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300
                    ${snapshot.isDraggingOver ? "bg-gradient-to-b from-indigo-50 to-indigo-100" : "bg-gray-50"}`}
                >
                  <h3 className="font-bold mb-3 text-gray-700 text-center text-sm md:text-base">
                    {statusLabels[status].toUpperCase()}
                  </h3>

                  {tasksByStatus[status].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id.toString()} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`mb-3 p-3 rounded-xl border-y-3 border-gray-200 shadow-sm transition-all duration-200 cursor-pointer
                            bg-white hover:shadow-lg hover:scale-[1.02] ${
                              snap.isDragging ? "bg-indigo-50 border-indigo-300 shadow-lg" : ""
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-800">{task.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                statusColors[task.status] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{task.assignee?.name || "Unassigned"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                          </p>

                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              className="text-blue-500 text-xs hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(task);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-500 text-xs hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task._id).then(fetchTasks);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          status={selectedStatus}
          onClose={() => setShowAddModal(false)}
          onSave={async (newTask) => {
            await onAddTask(newTask);
            fetchTasks();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}