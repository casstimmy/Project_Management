import mongoose, { Schema, models } from "mongoose";

const DrawingSchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["architectural", "mechanical", "electrical", "plumbing", "structural", "interior-design", "elv"],
      required: true,
    },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },
  },
  { timestamps: true }
);

DrawingSchema.index({ category: 1 });
DrawingSchema.index({ site: 1 });

export default models?.Drawing || mongoose.model("Drawing", DrawingSchema);
