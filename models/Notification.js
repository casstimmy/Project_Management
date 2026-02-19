import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "asset-alert", "maintenance-due", "work-order", "incident",
        "audit-reminder", "budget-alert", "emergency", "system", "general"
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    link: { type: String, default: "" }, // URL to navigate to
    module: { type: String, default: "" },
    entityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export default models.Notification || mongoose.model("Notification", NotificationSchema);
