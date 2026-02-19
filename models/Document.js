import mongoose, { Schema, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    fileType: { type: String, default: "" }, // pdf, doc, xls, etc.
    fileSize: { type: Number, default: 0 }, // bytes
    category: {
      type: String,
      enum: [
        "asset-document", "maintenance-record", "fca-report", "hsse-report",
        "emergency-plan", "budget-report", "policy", "procedure",
        "certificate", "warranty", "contract", "other"
      ],
      default: "other",
    },
    module: { type: String, default: "" },
    entityId: { type: Schema.Types.ObjectId },
    tags: [String],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    uploadedByName: { type: String, default: "" },
  },
  { timestamps: true }
);

DocumentSchema.index({ category: 1 });
DocumentSchema.index({ module: 1 });
DocumentSchema.index({ tags: 1 });

export default models.Document || mongoose.model("Document", DocumentSchema);
