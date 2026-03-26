import { mongooseConnect } from "@/lib/mongoose";
import FCAAssessment from "@/models/FCAAssessment";
import Site from "@/models/Site";
import Building from "@/models/Building";
import { sendApiError } from "@/lib/apiErrors";
import { authenticate } from "@/lib/auth";

async function enrichAssessmentPayload(payload = {}) {
  const data = { ...payload };

  if (!data.building) return data;

  const building = await Building.findById(data.building).select("name site").lean();
  if (!building) return data;

  const assessmentDate = data.assessmentDate ? new Date(data.assessmentDate) : new Date();
  const dateLabel = Number.isNaN(assessmentDate.getTime())
    ? "Undated"
    : assessmentDate.toISOString().slice(0, 10);

  if (!data.title?.trim()) {
    data.title = `${building.name} FCA - ${dateLabel}`;
  }

  if (!data.site && building.site) {
    data.site = building.site;
  }

  if (!data.assessor) {
    data.assessor = "";
  }

  return data;
}

export default async function handler(req, res) {
  if (!(await authenticate(req, res))) return;

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
      const data = await enrichAssessmentPayload(req.body);
      if (!data.building) {
        return res.status(400).json({ error: "Building is required" });
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

      Object.assign(fca, await enrichAssessmentPayload(data));
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
    return sendApiError(res, error, "Unable to save FCA assessment");
  }
}
