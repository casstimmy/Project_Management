import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import Project from "@/models/Project";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  if (method === "GET") {
    try {
      const { projectId } = req.query;
      if (!projectId) return res.status(400).json({ error: "projectId is required" });

      const tasks = await Task.find({ projectId }).sort({ dueDate: 1 });
      return res.json(tasks);
    } catch (err) {
      console.error("GET /api/tasks error:", err);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  if (method === "POST") {
    try {
      const { projectId, name, description, status, assignee, startDate, dueDate, priority, type } = req.body;

      // 1️⃣ Create Task
      const newTask = await Task.create({
        projectId,
        name,
        description,
        status,
        assignee,
        startDate: startDate || new Date(),
        dueDate: dueDate || new Date(),
        priority,
        type,
      });

      // 2️⃣ Push task to project.tasks
      await Project.findByIdAndUpdate(projectId, { $push: { tasks: newTask._id } });

      return res.status(201).json(newTask);
    } catch (err) {
      console.error("POST /api/tasks error:", err);
      return res.status(500).json({ error: "Failed to create task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
