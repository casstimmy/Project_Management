import mongoose, { Schema, models } from "mongoose";

const FacilitySpaceSchema = new Schema(
  {
    building: { type: Schema.Types.ObjectId, ref: "Building", required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    floor: { type: Number, default: 0 },
    type: {
      type: String,
      enum: [
        "office", "meeting-room", "server-room", "restroom", "kitchen",
        "lobby", "corridor", "storage", "parking", "mechanical", "electrical",
        "workshop", "laboratory", "common-area", "other"
      ],
      default: "office",
    },
    area: { type: Number }, // sq meters
    capacity: { type: Number },
    status: {
      type: String,
      enum: ["in-use", "vacant", "under-maintenance", "reserved"],
      default: "in-use",
    },
    description: { type: String, default: "" },
    assets: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

FacilitySpaceSchema.index({ building: 1 });
FacilitySpaceSchema.index({ floor: 1 });
FacilitySpaceSchema.index({ type: 1 });

export default models.FacilitySpace || mongoose.model("FacilitySpace", FacilitySpaceSchema);
