// /pages/api/tasks/today-overdue.js
import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await mongooseConnect();

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const token = authorization.split(" ")[1]; // expecting Bearer <token>
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      "assignee.email": userEmail,
      dueDate: { $lte: today },
    }).sort({ dueDate: 1 });

    return res.status(200).json(tasks);
  } catch (err) {
    console.error("GET /api/tasks/today-overdue error:", err);
    return res.status(500).json({ error: "Failed to load personal tasks" });
  }
}
