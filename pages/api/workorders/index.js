import { mongooseConnect } from "@/lib/mongoose";
import WorkOrder from "@/models/WorkOrder";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, assetId, status, priority, type, assignedToId, search } = req.query;

      if (id) {
        const wo = await WorkOrder.findById(id)
          .populate("asset", "name assetTag category")
          .populate("site", "name")
          .populate("building", "name");
        if (!wo) return res.status(404).json({ error: "Work order not found" });
        return res.json(wo);
      }

      const filter = {};
      if (assetId) filter.asset = assetId;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (type) filter.type = type;
      if (assignedToId) filter.assignedToId = assignedToId;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { workOrderNumber: { $regex: search, $options: "i" } },
          { assignedTo: { $regex: search, $options: "i" } },
        ];
      }

      const workOrders = await WorkOrder.find(filter)
        .populate("asset", "name assetTag")
        .sort({ createdAt: -1 });
      return res.json(workOrders);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title) return res.status(400).json({ error: "Title is required" });

      const wo = new WorkOrder(data);
      await wo.save();
      return res.status(201).json(wo);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Work order ID is required" });

      const wo = await WorkOrder.findById(_id);
      if (!wo) return res.status(404).json({ error: "Work order not found" });

      Object.assign(wo, data);
      await wo.save();
      return res.json(wo);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Work order ID is required" });

      const deleted = await WorkOrder.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Work order not found" });
      return res.json({ success: true, message: "Work order deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Work Orders API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
