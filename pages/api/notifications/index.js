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
      const { unreadOnly, page = 1, limit = 20 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const filter = { userId: user.id };
      if (unreadOnly === "true") filter.read = false;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Notification.countDocuments(filter),
        Notification.countDocuments({ userId: user.id, read: false }),
      ]);

      return res.json({ notifications, unreadCount, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    }

    if (method === "PUT") {
      const { notificationId, markAll } = req.body;

      if (markAll) {
        await Notification.updateMany({ userId: user.id, read: false }, { read: true, readAt: new Date() });
        return res.json({ success: true, message: "All notifications marked as read" });
      }

      if (notificationId) {
        await Notification.findOneAndUpdate(
          { _id: notificationId, userId: user.id },
          { read: true, readAt: new Date() }
        );
        return res.json({ success: true });
      }

      return res.status(400).json({ error: "notificationId or markAll is required" });
    }

    if (method === "DELETE") {
      const { notificationId, clearRead } = req.body || {};

      if (clearRead) {
        const result = await Notification.deleteMany({ userId: user.id, read: true });
        return res.json({ success: true, deleted: result.deletedCount || 0 });
      }

      if (notificationId) {
        await Notification.deleteOne({ _id: notificationId, userId: user.id });
        return res.json({ success: true });
      }

      return res.status(400).json({ error: "notificationId or clearRead is required" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Notifications API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
