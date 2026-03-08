import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { applyRateLimit, authLimiter } from "@/lib/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Strict rate limit on registration: 5 attempts per minute per IP
  if (!applyRateLimit(req, res, authLimiter, 5)) return;

  await mongooseConnect();

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  return res.status(201).json({
    message: "Admin created successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
}
