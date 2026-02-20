import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await mongooseConnect();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const email = decoded.email;

    if (!email) {
      return res.status(400).json({ error: "Email not found in token" });
    }

    const tasks = await Task.find({ "assignee.email": email })
      .sort({ dueDate: 1 });

    return res.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks/assigned error:", err);
    return res.status(500).json({ error: "Failed to fetch assigned tasks" });
  }
}
