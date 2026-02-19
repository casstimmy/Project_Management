import { mongooseConnect } from "@/lib/mongoose";
import Incident from "@/models/Incident";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, siteId, type, severity, status, search } = req.query;

      if (id) {
        const incident = await Incident.findById(id)
          .populate("site", "name")
          .populate("building", "name");
        if (!incident) return res.status(404).json({ error: "Incident not found" });
        return res.json(incident);
      }

      const filter = {};
      if (siteId) filter.site = siteId;
      if (type) filter.type = type;
      if (severity) filter.severity = severity;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { reportedBy: { $regex: search, $options: "i" } },
        ];
      }

      const incidents = await Incident.find(filter)
        .populate("site", "name")
        .sort({ incidentDate: -1 });
      return res.json(incidents);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title || !data.description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const incident = await Incident.create(data);
      return res.status(201).json(incident);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Incident ID is required" });

      const updated = await Incident.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) return res.status(404).json({ error: "Incident not found" });
      return res.json(updated);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Incident ID is required" });

      const deleted = await Incident.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Incident not found" });
      return res.json({ success: true, message: "Incident deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Incidents API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
