import { mongooseConnect } from "@/lib/mongoose";
import Space from "@/models/Space";
import Project from "@/models/Project";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  if (!(await authenticate(req, res))) return;

  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id } = req.query;
      if (id) {
        const space = await Space.findById(id).populate("projects");
        if (!space) return res.status(404).json({ error: "Space not found" });
        return res.json(space);
      }
      const spaces = await Space.find().populate("projects");
      return res.status(200).json(spaces);
    }

    if (method === "POST") {
      const { name, description, createdBy } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const newSpace = await Space.create({
        name,
        description: description || "",
        createdBy: createdBy || null,
        projects: [],
      });

      return res.status(201).json(newSpace);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Space ID is required" });

      const space = await Space.findByIdAndUpdate(_id, data, { new: true, runValidators: true });
      if (!space) return res.status(404).json({ error: "Space not found" });
      return res.json(space);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Space ID is required" });

      const deleted = await Space.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Space not found" });
      return res.json({ success: true, message: "Space deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Space API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
