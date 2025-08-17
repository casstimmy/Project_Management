// components/project/GanttChart.js
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import GanttChartLib from "react-gantt-chart"; // the library

export default function GanttChart({ project }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!project?._id) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?projectId=${project._id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Map tasks to react-gantt-chart format
          const formattedTasks = data.map(task => ({
            start: new Date(task.startDate || task.dueDate),
            end: new Date(task.dueDate),
            name: task.name,
            id: task._id,
            style: {
              backgroundColor:
                task.status === "todo"
                  ? "#6366F1" // indigo
                  : task.status === "inprogress"
                  ? "#FBBF24" // yellow
                  : task.status === "done"
                  ? "#10B981" // green
                  : "#9CA3AF", // gray
            },
          }));
          setTasks(formattedTasks);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, [project]);

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <h2 className="text-lg font-semibold">Gantt Chart – {project?.title}</h2>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {tasks.length > 0 ? (
          <div className="min-w-[800px]">
            <GanttChartLib tasks={tasks} />
          </div>
        ) : (
          <p className="text-gray-500">No tasks to display in the timeline.</p>
        )}
      </CardContent>
    </Card>
  );
}
