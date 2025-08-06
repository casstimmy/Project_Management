// /pages/api/tasks/personal.js
import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const tasks = await Task.find({
      type: "personal",
      "assignee.email": email,
      dueDate: { $lte: new Date() },
    }).sort({ dueDate: 1 });

    return res.status(200).json(tasks);
  } catch (err) {
    console.error("GET /api/tasks/personal error:", err);
    return res.status(500).json({ error: "Failed to load personal tasks" });
  }
}
