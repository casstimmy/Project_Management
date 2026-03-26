import { mongooseConnect } from "@/lib/mongoose";
import Task from "@/models/Task";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await authenticate(req, res);
  if (!user) return;

  await mongooseConnect();

  try {
    const email = user.email;

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
