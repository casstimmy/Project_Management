import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { applyRateLimit, authLimiter } from "@/lib/rateLimit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit: 5 attempts per minute per IP
  if (!applyRateLimit(req, res, authLimiter, 5)) return;

  await mongooseConnect();

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetToken = resetTokenHash;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Build the reset URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return res.status(500).json({ error: "Password reset email is not configured on this server." });
  }

  // Send the email
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort !== 465,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">Password Reset</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            Hi <strong>${user.name}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
    // Clear the token since email wasn't sent
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return res.status(500).json({ error: "Failed to send reset email. Please try again later." });
  }

  return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
}
