import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/MainLayout/Layout";
import TaskDetailModal from "@/components/Modal/TaskDetailModal";
import WorkspaceHeader from "@/components/project/WorkspaceHeader";
import BoardView from "@/components/project/BoardView";

import EquipmentChecklist from "@/components/project/EquipmentChecklist";
import GanttChart from "@/components/project/GanttChart";
import BudgetVsActual from "@/components/project/BudgetVsActual";
import WeeklyReport from "@/components/project/WeeklyReport";
import ListView from "@/components/project/ListView";
import Loader from "@/components/Loader";

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [newTasks, setNewTasks] = useState({});
  const [activeView, setActiveView] = useState("board");

  // === Fetch project with tasks
const fetchProject = useCallback(async () => {
  if (!id) return;
  try {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    setProject(data);
  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => {
  fetchProject();
}, [fetchProject]);

  useEffect(() => {
  if (!id) return; // wait for id to be available
  fetch(`/api/projects/${id}`)
    .then((res) => res.json())
    .then((data) => setProject(data));
}, [id]);

  // === Handlers
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });

      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error("Error moving task:", err);
    }
  };

  const handleNewTaskChange = (statusId, value) =>
    setNewTasks((prev) => ({ ...prev, [statusId]: value }));


  

const handleAddTask = async (newTask) => {
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, projectId: project._id }),
    });

    if (!res.ok) throw new Error("Failed to create task");

    const saved = await res.json();
    setProject((prev) => ({ ...prev, tasks: [...prev.tasks, saved] }));
  } catch (err) {
    console.error(err);
  }
};





  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        await fetchProject();
        setActiveTask(null);
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  if (loading || !project) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
                   <Loader />
                 </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <WorkspaceHeader
        project={project}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      <div className="p-6 space-y-6">
        {activeView === "board" && (
          <BoardView
            project={project}
            onDragEnd={handleDragEnd}
            newTasks={newTasks}
            onNewTaskChange={handleNewTaskChange}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onTaskClick={setActiveTask}
          />
        )}

      {activeView === "list" && (
  <ListView
    project={project}
    onTaskClick={setActiveTask}
    onDeleteTask={handleDeleteTask}
  />
)}

       

        {activeView === "checklist" && (
          <EquipmentChecklist project={project} />
        )}

       {activeView === "gantt" && <GanttChart project={project} />}

        {activeView === "budget" && (
          <BudgetVsActual data={project.budgetData || []} />
        )}

        {activeView === "reports" && (
          <WeeklyReport reports={project.reports || []} />
        )}
      </div>

      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </Layout>
  );
}
