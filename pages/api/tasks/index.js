// /pages/api/tasks/index.js
import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await mongooseConnect();

  const { method } = req;

  if (method === "GET") {
    try {
      const { assignedTo, type } = req.query;

      let query = {};

      if (assignedTo === "me") {
        // Simulated logged-in user email (replace with real auth later)
        query["assignee.email"] = "user@example.com";
      }

      if (type) {
        query.type = type;
      }

      const tasks = await Task.find(query).sort({ dueDate: 1 });
      res.json(tasks);
    } catch (err) {
      console.error("GET /api/tasks error:", err);
      res.status(500).json({ error: "Failed to load tasks" });
    }
  }

  if (method === "POST") {
    try {
      const newTask = await Task.create(req.body);
      res.status(201).json(newTask);
    } catch (err) {
      console.error("POST /api/tasks error:", err);
      res.status(500).json({ error: "Failed to create task" });
    }
  }
}
