import mongoose, { Schema, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    action: {
      type: String,
      enum: ["create", "update", "delete", "view", "login", "logout", "export", "approve", "reject"],
      required: true,
    },
    module: {
      type: String,
      enum: [
        "assets", "sites", "buildings", "spaces", "fca", "hsse",
        "incidents", "emergency", "maintenance", "work-orders",
        "budgets", "users", "auth", "reports", "system"
      ],
      required: true,
    },
    entityType: { type: String }, // e.g., "Asset", "WorkOrder"
    entityId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
    details: { type: Schema.Types.Mixed }, // JSON details of changes
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ module: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
