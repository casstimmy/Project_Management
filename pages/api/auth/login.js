import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { applyRateLimit, authLimiter } from "@/lib/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Strict rate limit on login: 10 attempts per minute per IP
  if (!applyRateLimit(req, res, authLimiter, 10)) return;

  await mongooseConnect();

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: "No account was found for that email address" });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "This account has been deactivated" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "The password you entered is incorrect" });
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({ token });
}
