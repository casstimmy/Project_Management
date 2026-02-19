import { mongooseConnect } from "@/lib/mongoose";
import EmergencyPlan from "@/models/EmergencyPlan";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, siteId, status } = req.query;

      if (id) {
        const plan = await EmergencyPlan.findById(id).populate("site", "name");
        if (!plan) return res.status(404).json({ error: "Plan not found" });
        return res.json(plan);
      }

      const filter = {};
      if (siteId) filter.site = siteId;
      if (status) filter.status = status;

      const plans = await EmergencyPlan.find(filter)
        .populate("site", "name")
        .sort({ updatedAt: -1 });
      return res.json(plans);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title || !data.site) {
        return res.status(400).json({ error: "Title and site are required" });
      }

      const plan = await EmergencyPlan.create(data);
      return res.status(201).json(plan);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Plan ID is required" });

      const plan = await EmergencyPlan.findById(_id);
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      Object.assign(plan, data);
      await plan.save();
      return res.json(plan);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Plan ID is required" });

      const deleted = await EmergencyPlan.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Plan not found" });
      return res.json({ success: true, message: "Plan deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Emergency API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
