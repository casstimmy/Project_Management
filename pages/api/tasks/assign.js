import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

  await mongooseConnect();

  if (req.method === "POST") {
    try {
      const { name, description, priority, dueDate, startDate, status, assigneeName, assigneeEmail, projectId } = req.body;
      if (!name) return res.status(400).json({ error: "Task name is required" });
      if (!assigneeEmail) return res.status(400).json({ error: "Assignee email is required" });

      const task = await Task.create({
        name,
        description: description || "",
        priority: priority || "medium",
        status: status || "todo",
        startDate: startDate || new Date(),
        dueDate: dueDate || new Date(),
        projectId: projectId || undefined,
        assignee: { name: assigneeName || "", email: assigneeEmail },
      });

      if (projectId) {
        await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });
      }

      return res.status(201).json(task);
    } catch (err) {
      console.error("POST /api/tasks/assign error:", err);
      return res.status(500).json({ error: "Failed to assign task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
