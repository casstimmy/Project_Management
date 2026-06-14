import { mongooseConnect } from "@/lib/mongoose";
import WorkOrder from "@/models/WorkOrder";
import Asset from "@/models/Asset";
import Site from "@/models/Site";
import Building from "@/models/Building";
import { sendApiError } from "@/lib/apiErrors";
import { authenticate } from "@/lib/auth";
import { notifyAdmins, notifyUser } from "@/lib/notificationService";

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

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

      const wo = new WorkOrder({ ...data, createdBy: data.createdBy || user.id });
      await wo.save();

      await notifyAdmins(
        {
          title: "New Work Order Created",
          message: `${wo.workOrderNumber || "New WO"}: ${wo.title}`,
          type: "work-order",
          priority: wo.priority || "medium",
          link: `/workorders?highlight=${wo._id}`,
          module: "workorders",
          entityId: wo._id,
        },
        { excludeUserId: user.id }
      );

      if (wo.assignedToId) {
        await notifyUser(wo.assignedToId, {
          title: "Work Order Assigned",
          message: `${wo.workOrderNumber || "WO"} assigned to you: ${wo.title}`,
          type: "work-order",
          priority: wo.priority || "medium",
          link: `/workorders?highlight=${wo._id}`,
          module: "workorders",
          entityId: wo._id,
        });
      }

      return res.status(201).json(wo);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Work order ID is required" });

      const wo = await WorkOrder.findById(_id);
      if (!wo) return res.status(404).json({ error: "Work order not found" });
      const prevStatus = wo.status;
      const prevAssignee = wo.assignedToId ? String(wo.assignedToId) : "";

      Object.assign(wo, data);
      await wo.save();

      if (data.status && data.status !== prevStatus) {
        await notifyAdmins(
          {
            title: "Work Order Status Updated",
            message: `${wo.workOrderNumber || "WO"} moved ${prevStatus || "-"} -> ${wo.status}`,
            type: "work-order",
            priority: wo.priority || "medium",
            link: `/workorders?highlight=${wo._id}`,
            module: "workorders",
            entityId: wo._id,
          },
          { excludeUserId: user.id }
        );
      }

      if (wo.assignedToId && String(wo.assignedToId) !== prevAssignee) {
        await notifyUser(wo.assignedToId, {
          title: "Work Order Assigned",
          message: `${wo.workOrderNumber || "WO"} assigned to you: ${wo.title}`,
          type: "work-order",
          priority: wo.priority || "medium",
          link: `/workorders?highlight=${wo._id}`,
          module: "workorders",
          entityId: wo._id,
        });
      }

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
    return sendApiError(res, error, "Unable to save work order");
  }
}
