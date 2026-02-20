import { mongooseConnect } from "@/lib/mongoose";
import Equipment from "@/models/Equipment";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  try {
    /** -------------------- GET -------------------- */
    if (method === "GET") {
      const { id, search, projectId } = req.query;

      if (id) {
        const item = await Equipment.findById(id);
        if (!item) {
          return res.status(404).json({ success: false, message: "Equipment not found" });
        }
        return res.json(item);
      }

      // Build filter
      const filter = {};
      if (projectId) filter.projectId = projectId;

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { condition: { $regex: search, $options: "i" } },
          { details: { $regex: search, $options: "i" } },
        ];
      }

      const items = await Equipment.find(filter);
      return res.json(items);
    }

    /** -------------------- POST -------------------- */
    if (method === "POST") {
      const { name, details, condition = "Good", imageUrl = "", checked = false } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }

      const item = await Equipment.create({
        name,
        details,
        condition,
        imageUrl,
        checked,
        projectId: req.body.projectId || undefined,
      });

      return res.status(201).json(item);
    }

    /** -------------------- PUT -------------------- */
    if (method === "PUT") {
      const { _id, ...data } = req.body;

      if (!_id) {
        return res.status(400).json({ success: false, message: "Equipment ID is required" });
      }

      const updated = await Equipment.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Equipment not found" });
      }

      return res.json(updated);
    }

    /** -------------------- DELETE -------------------- */
    if (method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ success: false, message: "Equipment ID is required" });
      }

      const deleted = await Equipment.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Equipment not found" });
      }

      return res.json({ success: true, message: "Deleted successfully" });
    }

    /** -------------------- METHOD NOT ALLOWED -------------------- */
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });

  } catch (error) {
    console.error("Equipment API error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
