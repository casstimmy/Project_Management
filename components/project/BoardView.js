import { useState, useEffect, useMemo, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddTaskModal from "../Modal/AddTaskModal";

const statuses = ["todo", "inprogress", "done"];
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
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg overflow-hidden mb-6 transition-all duration-300 hover:shadow-2xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex justify-between items-center bg-white hover:bg-gray-100 focus:outline-none transition"
      >
        <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
        <span className="text-gray-600">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-2 border-t border-gray-200 bg-white">
          {project.objectives?.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Objectives:</span>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {project.objectives.map((o, i) => (
                  <li key={i}>{o.text}</li>
                ))}
              </ul>
            </div>
          )}
          {project.responsibilities?.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Responsibilities:</span>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {project.responsibilities.map((r, i) => (
                  <li key={i}>{`${r.role}: ${r.responsibility}`}</li>
                ))}
              </ul>
            </div>
          )}
          {project.budget?.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Budget:</span>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {project.budget.map((b, i) => (
                  <li key={i}>{`${b.category}: $${b.amount}`}</li>
                ))}
              </ul>
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
                    {status.toUpperCase()}
                  </h3>

                  {tasksByStatus[status].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id.toString()} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`mb-3 p-3 rounded-xl border shadow-sm transition-all duration-200 cursor-pointer
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
