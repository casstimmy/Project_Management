import mongoose, { Schema, models } from "mongoose";

const SiteSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    contactPerson: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    totalArea: { type: Number }, // sq meters
    status: {
      type: String,
      enum: ["active", "inactive", "under-construction", "decommissioned"],
      default: "active",
    },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    buildings: [{ type: Schema.Types.ObjectId, ref: "Building" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SiteSchema.index({ name: 1 });
SiteSchema.index({ code: 1 });
SiteSchema.index({ status: 1 });

export default models.Site || mongoose.model("Site", SiteSchema);
