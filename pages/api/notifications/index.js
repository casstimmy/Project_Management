import { mongooseConnect } from "@/lib/mongoose";
import Notification from "@/models/Notification";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    const user = await authenticate(req, res);
    if (!user) return;

    if (method === "GET") {
      const { unreadOnly } = req.query;
      const filter = { userId: user.id };
      if (unreadOnly === "true") filter.read = false;

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({ userId: user.id, read: false });
      return res.json({ notifications, unreadCount });
    }

    if (method === "PUT") {
      const { notificationId, markAll } = req.body;

      if (markAll) {
        await Notification.updateMany({ userId: user.id, read: false }, { read: true, readAt: new Date() });
        return res.json({ success: true, message: "All notifications marked as read" });
      }

      if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, { read: true, readAt: new Date() });
        return res.json({ success: true });
      }

      return res.status(400).json({ error: "notificationId or markAll is required" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Notifications API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
