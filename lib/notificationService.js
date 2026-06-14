import User from "@/models/User";
import { createNotification } from "@/lib/auditLogger";

async function safeCreate(payload) {
  if (!payload?.userId) return;
  try {
    await createNotification(payload);
  } catch (err) {
    console.error("safeCreate notification error:", err);
  }
}

export async function notifyUser(userId, payload) {
  if (!userId) return;
  await safeCreate({ ...payload, userId });
}

export async function notifyAdmins(payload, { excludeUserId } = {}) {
  const admins = await User.find({ role: "admin", isActive: { $ne: false } }).select("_id");
  const ids = admins
    .map((u) => String(u._id))
    .filter((id) => id && (!excludeUserId || id !== String(excludeUserId)));

  for (const id of ids) {
    await safeCreate({ ...payload, userId: id });
  }
}

export async function notifyUserByEmail(email, payload) {
  if (!email) return;
  const user = await User.findOne({ email: String(email).toLowerCase().trim(), isActive: { $ne: false } }).select("_id");
  if (!user) return;
  await safeCreate({ ...payload, userId: user._id });
}
