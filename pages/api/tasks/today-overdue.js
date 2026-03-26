// /pages/api/tasks/today-overdue.js
import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

  await mongooseConnect();

  try {
    const userEmail = user.email;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get tasks due today or overdue (not completed)
    const tasks = await Task.find({
      "assignee.email": userEmail,
      status: { $ne: "done" },
      dueDate: { $lte: endOfToday },
    }).sort({ dueDate: 1 });

    return res.status(200).json(tasks);
  } catch (err) {
    console.error("GET /api/tasks/today-overdue error:", err);
    return res.status(500).json({ error: "Failed to load tasks" });
  }
}
