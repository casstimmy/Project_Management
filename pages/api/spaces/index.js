import { mongooseConnect } from "@/lib/mongoose";
import Space from "@/models/Space";
import Project from "@/models/Project"; // ✅ Import Project model so populate works

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      // ✅ Ensure populate knows the "Project" model
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

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Space API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
