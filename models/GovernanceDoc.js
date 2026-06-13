import mongoose, { Schema, models } from "mongoose";

const GovernanceDocSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["contract", "sla", "governing-code", "policy", "regulation"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "draft", "under-review", "terminated"],
      default: "draft",
    },
    // Contract/SLA fields
    parties: [{ name: String, role: String }],
    startDate: { type: Date },
    endDate: { type: Date },
    value: { type: Number, default: 0 },
    // SLA-specific
    serviceLevel: { type: String, default: "" },
    responseTime: { type: String, default: "" },
    penalties: { type: String, default: "" },
    // General
    description: { type: String, default: "" },
    reference: { type: String, default: "" }, // reference number
    notes: { type: String, default: "" },
    documents: [{ name: String, url: String }],
    // Relations
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

GovernanceDocSchema.index({ type: 1, status: 1 });

export default models?.GovernanceDoc || mongoose.model("GovernanceDoc", GovernanceDocSchema);
