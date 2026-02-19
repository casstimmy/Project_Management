import { mongooseConnect } from "@/lib/mongoose";
import MaintenancePlan from "@/models/MaintenancePlan";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, assetId, status, maintenanceType, search } = req.query;

      if (id) {
        const plan = await MaintenancePlan.findById(id)
          .populate("asset", "name assetTag category")
          .populate("site", "name")
          .populate("building", "name");
        if (!plan) return res.status(404).json({ error: "Plan not found" });
        return res.json(plan);
      }

      const filter = {};
      if (assetId) filter.asset = assetId;
      if (status) filter.status = status;
      if (maintenanceType) filter.maintenanceType = maintenanceType;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { assignedTo: { $regex: search, $options: "i" } },
        ];
      }

      const plans = await MaintenancePlan.find(filter)
        .populate("asset", "name assetTag category")
        .sort({ nextDueDate: 1 });
      return res.json(plans);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title || !data.asset || !data.maintenanceType) {
        return res.status(400).json({ error: "Title, asset, and maintenance type are required" });
      }

      const plan = await MaintenancePlan.create(data);
      return res.status(201).json(plan);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Plan ID is required" });

      const updated = await MaintenancePlan.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) return res.status(404).json({ error: "Plan not found" });
      return res.json(updated);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Plan ID is required" });

      const deleted = await MaintenancePlan.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Plan not found" });
      return res.json({ success: true, message: "Plan deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Maintenance API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
