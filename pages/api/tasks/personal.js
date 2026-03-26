// /pages/api/tasks/personal.js
import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

  await mongooseConnect();

  const email = user.email;

  if (req.method === "GET") {
    try {
      const tasks = await Task.find({
        "assignee.email": email,
        $or: [
          { projectId: { $exists: false } },
          { projectId: null },
        ],
      }).sort({ createdAt: -1 });

      return res.status(200).json(tasks);
    } catch (err) {
      console.error("GET /api/tasks/personal error:", err);
      return res.status(500).json({ error: "Failed to load personal tasks" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, description, priority, dueDate, status } = req.body;
      if (!name) return res.status(400).json({ error: "Task name is required" });

      const task = await Task.create({
        name,
        description: description || "",
        priority: priority || "medium",
        status: status || "todo",
        startDate: new Date(),
        dueDate: dueDate || new Date(),
        assignee: { name: user.name, email: user.email },
      });

      return res.status(201).json(task);
    } catch (err) {
      console.error("POST /api/tasks/personal error:", err);
      return res.status(500).json({ error: "Failed to create task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
