import AuditLog from "@/models/AuditLog";
import { mongooseConnect } from "@/lib/mongoose";

/**
 * Log an audit trail entry
 */
export async function logAudit({
  userId,
  userName,
  action,
  module,
  entityType,
  entityId,
  description,
  details,
  ipAddress = "",
}) {
  try {
    await mongooseConnect();
    await AuditLog.create({
      userId,
      userName,
      action,
      module,
      entityType,
      entityId,
      description,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

/**
 * Create notification
 */
import Notification from "@/models/Notification";

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
  priority = "medium",
  link = "",
  module = "",
  entityId,
}) {
  try {
    await mongooseConnect();
    await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      link,
      module,
      entityId,
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
}
