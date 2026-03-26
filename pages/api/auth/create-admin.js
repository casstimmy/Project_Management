import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await mongooseConnect();
    const userCount = await User.countDocuments();
    return res.status(200).json({ requiresSetup: userCount === 0 });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await mongooseConnect();

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    const actor = await authenticate(req, res);
    if (!actor) return;

    if (actor.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create other admin users" });
    }
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email: normalizedEmail,
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
