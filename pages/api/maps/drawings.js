import { mongooseConnect } from "@/lib/mongoose";
import Drawing from "@/models/Drawing";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  if (!(await authenticate(req, res))) return;

  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, category } = req.query;

      if (id) {
        const drawing = await Drawing.findById(id);
        if (!drawing) return res.status(404).json({ error: "Drawing not found" });
        return res.json(drawing);
      }

      const filter = {};
      if (category) filter.category = category;

      const drawings = await Drawing.find(filter).sort({ uploadedAt: -1 });
      return res.json(drawings);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title || !data.category || !data.fileUrl) {
        return res.status(400).json({ error: "Title, category, and file are required" });
      }

      const drawing = await Drawing.create(data);
      return res.status(201).json(drawing);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Drawing ID is required" });

      const deleted = await Drawing.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Drawing not found" });
      return res.json({ success: true, message: "Drawing deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Drawings API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
