// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "facility-manager", "technician", "auditor", "finance-officer", "viewer"],
      default: "viewer",
    },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    avatar: { type: String, default: "" },
    sites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Site" }], // accessible sites
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
