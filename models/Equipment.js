// /models/Equipment.js
import mongoose from "mongoose";
const { Schema, models } = mongoose;

const EquipmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    details: { type: String, default: "" },
    condition: {
      type: String,
      enum: ["Good", "Needs Repair", "Replace Soon"],
      default: "Good",
    },
    imageUrl: { type: String, default: "" },
    checked: { type: Boolean, default: false },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

export default models.Equipment || mongoose.model("Equipment", EquipmentSchema);
