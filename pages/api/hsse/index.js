import { mongooseConnect } from "@/lib/mongoose";
import HSSEAudit from "@/models/HSSEAudit";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, buildingId, status, auditType, search } = req.query;

      if (id) {
        const audit = await HSSEAudit.findById(id)
          .populate("site", "name")
          .populate("building", "name");
        if (!audit) return res.status(404).json({ error: "Audit not found" });
        return res.json(audit);
      }

      const filter = {};
      if (buildingId) filter.building = buildingId;
      if (status) filter.status = status;
      if (auditType) filter.auditType = auditType;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { auditor: { $regex: search, $options: "i" } },
        ];
      }

      const audits = await HSSEAudit.find(filter)
        .populate("building", "name")
        .sort({ auditDate: -1 });
      return res.json(audits);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title) return res.status(400).json({ error: "Title is required" });

      const audit = new HSSEAudit(data);
      await audit.save();
      return res.status(201).json(audit);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Audit ID is required" });

      const audit = await HSSEAudit.findById(_id);
      if (!audit) return res.status(404).json({ error: "Audit not found" });

      Object.assign(audit, data);
      await audit.save();
      return res.json(audit);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Audit ID is required" });

      const deleted = await HSSEAudit.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Audit not found" });
      return res.json({ success: true, message: "Audit deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("HSSE API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
