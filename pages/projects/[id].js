// pages/projects/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PageLayout from "@/components/MainLayout/PageLayout";
import TaskDetailModal from "@/components/Modal/TaskDetailModal";

const statusesOrder = ["todo", "inprogress", "done"];

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [newTasks, setNewTasks] = useState({});

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const res = await fetch(`/api/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: destination.droppableId }),
    });

    if (res.ok) fetchProject();
  };

  const handleNewTaskChange = (statusId, value) => {
    setNewTasks((prev) => ({ ...prev, [statusId]: value }));
  };

  const handleAddTask = async (statusId) => {
    const name = newTasks[statusId];
    if (!name?.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: id,
        status: statusId,
        name,
      }),
    });

    if (res.ok) {
      setNewTasks((prev) => ({ ...prev, [statusId]: "" }));
      fetchProject();
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) fetchProject();
  };

  const handleUpdateTask = async (taskId, updates) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) fetchProject();
  };

  if (loading || !project) {
    return (
      <PageLayout>
        <div className="p-6">Loading project...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusesOrder.map((statusId) => {
              const col = project.statuses?.find((s) => s.id === statusId);

              return (
                <div key={statusId} className="bg-gray-50 rounded-lg p-3 border">
                  <h2 className="font-semibold mb-2">
                    {col?.label || statusId.toUpperCase()}
                  </h2>

                  <Droppable droppableId={statusId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[50px] space-y-2"
                      >
                        {col?.tasks?.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 bg-white rounded shadow text-sm border hover:bg-gray-50"
                                onClick={() => setActiveTask(task)}
                              >
                                <div className="flex justify-between">
                                  <p className="font-medium">{task.name}</p>
                                  <button
                                    className="text-red-500 hover:underline text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task._id);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {task.assignee || "Unassigned"}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      placeholder="New Task"
                      value={newTasks[statusId] || ""}
                      onChange={(e) => handleNewTaskChange(statusId, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => handleAddTask(statusId)}
                      className="text-indigo-600 text-xs hover:underline"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </PageLayout>
  );
}
