// /pages/api/tasks/[id].js
import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import Project from "@/models/Project";

export default async function handler(req, res) {
  await mongooseConnect();
  const { id } = req.query; // this is the task ID

  if (req.method === "GET") {
    try {
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      return res.json(task);
    } catch (err) {
      console.error("GET /api/tasks/[id] error:", err);
      return res.status(500).json({ error: "Failed to fetch task" });
    }
  }

  if (req.method === "PUT") {
    try {
      const updated = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) return res.status(404).json({ error: "Task not found" });
      return res.json(updated);
    } catch (err) {
      console.error("PUT /api/tasks/[id] error:", err);
      return res.status(500).json({ error: "Failed to update task" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const task = await Task.findByIdAndDelete(id);
      if (!task) return res.status(404).json({ error: "Task not found" });

      // Remove task from project.tasks array if it belongs to a project
      if (task.projectId) {
        await Project.findByIdAndUpdate(task.projectId, { $pull: { tasks: task._id } });
      }

      return res.json({ message: "Task deleted" });
    } catch (err) {
      console.error("DELETE /api/tasks/[id] error:", err);
      return res.status(500).json({ error: "Failed to delete task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
