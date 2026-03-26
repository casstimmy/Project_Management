import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { applyRateLimit, authLimiter } from "@/lib/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit: 5 attempts per minute per IP
  if (!applyRateLimit(req, res, authLimiter, 5)) return;

  await mongooseConnect();

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetToken: tokenHash,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  // Hash the new password and clear the token
  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return res.status(200).json({ message: "Password has been reset successfully" });
}
