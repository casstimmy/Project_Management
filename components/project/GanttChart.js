// components/project/GanttChart.js
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Gantt } from "react-virtual-gantt";

export default function GanttChart({ project }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!project?.tasks) return;

    // Map tasks to Gantt format
    const mappedTasks = project.tasks.map((task) => ({
      id: task._id,
      name: task.name,
      start: task.startDate || task.dueDate,
      end: task.dueDate,
      progress: task.progress || 0,
    }));

    setTasks(mappedTasks);
  }, [project]);

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <h2 className="text-lg font-semibold">Gantt Chart – {project?.title}</h2>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {tasks.length > 0 ? (
          <Gantt tasks={tasks} />
        ) : (
          <p className="text-gray-500">No tasks to display in the timeline.</p>
        )}
      </CardContent>
    </Card>
  );
}
