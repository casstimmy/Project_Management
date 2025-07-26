// pages/projects/kanban.js
import Layout from "@/components/Layout";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const initialData = {
  columns: [
    {
      id: "todo",
      title: "To Do",
      color: "border-blue-400",
      tasks: [
        { id: "task-1", content: "Design wireframes" },
        { id: "task-2", content: "Define API structure" },
      ],
    },
    {
      id: "inProgress",
      title: "In Progress",
      color: "border-yellow-400",
      tasks: [{ id: "task-3", content: "Build UI components" }],
    },
    {
      id: "done",
      title: "Done",
      color: "border-green-400",
      tasks: [{ id: "task-4", content: "Project kickoff meeting" }],
    },
  ],
};

export default function KanbanPage() {
  const [data, setData] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "column") {
      const columns = [...data.columns];
      const [removed] = columns.splice(source.index, 1);
      columns.splice(destination.index, 0, removed);
      setData({ columns });
    } else {
      const columns = [...data.columns];
      const sourceCol = columns.find((c) => c.id === source.droppableId);
      const destCol = columns.find((c) => c.id === destination.droppableId);
      const sourceTasks = [...sourceCol.tasks];
      const destTasks = [...destCol.tasks];
      const [movedTask] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, movedTask);

      const newColumns = columns.map((col) => {
        if (col.id === sourceCol.id) return { ...col, tasks: sourceTasks };
        if (col.id === destCol.id) return { ...col, tasks: destTasks };
        return col;
      });

      setData({ columns: newColumns });
    }
  };

  const openTaskModal = (columnId, task = null) => {
    setActiveColumnId(columnId);
    if (task) {
      setEditMode(true);
      setNewTaskContent(task.content);
      setEditingTaskId(task.id);
    } else {
      setEditMode(false);
      setNewTaskContent("");
    }
    setShowModal(true);
  };

  const handleSaveTask = () => {
    if (!newTaskContent.trim()) return;

    if (editMode) {
      const columns = data.columns.map((col) =>
        col.id === activeColumnId
          ? {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === editingTaskId
                  ? { ...task, content: newTaskContent }
                  : task
              ),
            }
          : col
      );
      setData({ columns });
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        content: newTaskContent,
      };
      const columns = data.columns.map((col) =>
        col.id === activeColumnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      );
      setData({ columns });
    }

    setShowModal(false);
  };

  return (
    <Layout>
      <div className="min-h-screen px-8 py-8 sm:py-10 bg-gradient-to-br from-slate-100 to-blue-50">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-gray-800">
          Kanban Board
        </h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="column">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col md:flex-row gap-4 sm:gap-6 md:overflow-x-auto pb-4"
              >
                {data.columns.map((column, colIndex) => (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={colIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white rounded-2xl shadow-md w-full md:w-72 lg:w-80 flex-shrink-0 border-t-4"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className={clsx(
                            "p-3 sm:p-4 flex justify-between items-center",
                            column.color
                          )}
                        >
                          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                            {column.title}
                          </h2>
                          <button
                            onClick={() => openTaskModal(column.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Plus size={20} />
                          </button>
                        </div>

                        <Droppable droppableId={column.id} type="task">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={clsx(
                                "p-3 space-y-3 min-h-[120px] transition-all duration-200",
                                snapshot.isDraggingOver
                                  ? "bg-blue-50"
                                  : "bg-white"
                              )}
                            >
                              {column.tasks.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <motion.div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      layout
                                      className={clsx(
                                        "p-3 rounded-md shadow-sm border-l-4 text-sm text-gray-800 font-medium flex justify-between items-center gap-2 transition duration-200",
                                        column.color,
                                        snapshot.isDragging
                                          ? "shadow-lg bg-blue-50"
                                          : "bg-white hover:bg-gray-50"
                                      )}
                                    >
                                      <span className="w-full break-words">
                                        {task.content}
                                      </span>
                                      <button
                                        onClick={() =>
                                          openTaskModal(column.id, task)
                                        }
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Modal for Add/Edit */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-md"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                    {editMode ? "Edit Task" : "Add New Task"}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  placeholder="Enter task content..."
                  className="w-full border px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <button
                  onClick={handleSaveTask}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full text-sm"
                >
                  {editMode ? "Save Changes" : "Add Task"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
