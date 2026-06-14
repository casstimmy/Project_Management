import { mongooseConnect } from "@/lib/mongoose";
import MaintenancePlan from "@/models/MaintenancePlan";
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

      const plan = await MaintenancePlan.create({ ...data, createdBy: data.createdBy || user.id });

      await notifyAdmins(
        {
          title: "Maintenance Plan Created",
          message: `${plan.title} (${plan.maintenanceType}) added${plan.nextDueDate ? `, next due ${new Date(plan.nextDueDate).toLocaleDateString()}` : ""}.`,
          type: "maintenance-due",
          priority: plan.priority || "medium",
          link: `/maintenance?highlight=${plan._id}`,
          module: "maintenance",
          entityId: plan._id,
        },
        { excludeUserId: user.id }
      );

      if (plan.assignedToId) {
        await notifyUser(plan.assignedToId, {
          title: "Maintenance Plan Assigned",
          message: `You were assigned maintenance plan: ${plan.title}`,
          type: "maintenance-due",
          priority: plan.priority || "medium",
          link: `/maintenance?highlight=${plan._id}`,
          module: "maintenance",
          entityId: plan._id,
        });
      }

      return res.status(201).json(plan);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Plan ID is required" });

      const existing = await MaintenancePlan.findById(_id);
      const updated = await MaintenancePlan.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) return res.status(404).json({ error: "Plan not found" });

      if (existing && data.status && data.status !== existing.status) {
        await notifyAdmins(
          {
            title: "Maintenance Status Updated",
            message: `${updated.title} moved ${existing.status || "-"} -> ${updated.status}`,
            type: "maintenance-due",
            priority: updated.priority || "medium",
            link: `/maintenance?highlight=${updated._id}`,
            module: "maintenance",
            entityId: updated._id,
          },
          { excludeUserId: user.id }
        );
      }

      if (updated.assignedToId && (!existing?.assignedToId || String(updated.assignedToId) !== String(existing.assignedToId))) {
        await notifyUser(updated.assignedToId, {
          title: "Maintenance Plan Assigned",
          message: `You were assigned maintenance plan: ${updated.title}`,
          type: "maintenance-due",
          priority: updated.priority || "medium",
          link: `/maintenance?highlight=${updated._id}`,
          module: "maintenance",
          entityId: updated._id,
        });
      }

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
    return sendApiError(res, error, "Unable to save maintenance plan");
  }
}
