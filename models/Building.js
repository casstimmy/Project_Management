import mongoose, { Schema, models } from "mongoose";

const BuildingSchema = new Schema(
  {
    site: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    type: {
      type: String,
      enum: ["office", "warehouse", "residential", "commercial", "industrial", "mixed-use", "other"],
      default: "office",
    },
    floors: { type: Number, default: 1 },
    totalArea: { type: Number }, // sq meters
    yearBuilt: { type: Number },
    status: {
      type: String,
      enum: ["operational", "under-maintenance", "under-construction", "decommissioned"],
      default: "operational",
    },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    address: { type: String, default: "" },
    spaces: [{ type: Schema.Types.ObjectId, ref: "FacilitySpace" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BuildingSchema.index({ site: 1 });
BuildingSchema.index({ name: 1 });
BuildingSchema.index({ status: 1 });

export default models.Building || mongoose.model("Building", BuildingSchema);
