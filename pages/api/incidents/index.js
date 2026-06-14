import { mongooseConnect } from "@/lib/mongoose";
import Incident from "@/models/Incident";
import Site from "@/models/Site";
import Building from "@/models/Building";
import { sendApiError } from "@/lib/apiErrors";
import { authenticate } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notificationService";

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

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
      if (!data.title) {
        return res.status(400).json({ error: "Title is required" });
      }
      // Set a default description if not provided
      if (!data.description) data.description = data.title;

      const incident = await Incident.create({ ...data, createdBy: data.createdBy || user.id });

      await notifyAdmins(
        {
          title: "New Incident Reported",
          message: `${incident.title} (${incident.severity || "minor"}) at ${incident.location || "unspecified location"}.`,
          type: "incident",
          priority:
            incident.severity === "critical"
              ? "critical"
              : incident.severity === "major"
              ? "high"
              : incident.severity === "moderate"
              ? "medium"
              : "low",
          link: `/incidents?highlight=${incident._id}`,
          module: "incidents",
          entityId: incident._id,
        },
        { excludeUserId: user.id }
      );

      return res.status(201).json(incident);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Incident ID is required" });

      const previous = await Incident.findById(_id);
      const updated = await Incident.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) return res.status(404).json({ error: "Incident not found" });

      if (previous && (data.status && data.status !== previous.status)) {
        await notifyAdmins(
          {
            title: "Incident Status Updated",
            message: `${updated.title}: ${previous.status || "reported"} -> ${updated.status}`,
            type: "incident",
            priority:
              updated.severity === "critical"
                ? "critical"
                : updated.severity === "major"
                ? "high"
                : "medium",
            link: `/incidents?highlight=${updated._id}`,
            module: "incidents",
            entityId: updated._id,
          },
          { excludeUserId: user.id }
        );
      }

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
    return sendApiError(res, error, "Unable to save incident");
  }
}
