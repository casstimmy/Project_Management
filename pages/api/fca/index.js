import { mongooseConnect } from "@/lib/mongoose";
import FCAAssessment from "@/models/FCAAssessment";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, buildingId, status, search } = req.query;

      if (id) {
        const fca = await FCAAssessment.findById(id)
          .populate("site", "name")
          .populate("building", "name");
        if (!fca) return res.status(404).json({ error: "Assessment not found" });
        return res.json(fca);
      }

      const filter = {};
      if (buildingId) filter.building = buildingId;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { assessor: { $regex: search, $options: "i" } },
        ];
      }

      const assessments = await FCAAssessment.find(filter)
        .populate("building", "name")
        .sort({ assessmentDate: -1 });
      return res.json(assessments);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title || !data.building) {
        return res.status(400).json({ error: "Title and building are required" });
      }

      const fca = new FCAAssessment(data);
      await fca.save();
      return res.status(201).json(fca);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Assessment ID is required" });

      const fca = await FCAAssessment.findById(_id);
      if (!fca) return res.status(404).json({ error: "Assessment not found" });

      Object.assign(fca, data);
      await fca.save();
      return res.json(fca);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Assessment ID is required" });

      const deleted = await FCAAssessment.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Assessment not found" });
      return res.json({ success: true, message: "Assessment deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("FCA API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
