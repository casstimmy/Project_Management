import mongoose, { Schema, model, models } from "mongoose";

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ["Worker", "Specialist"], default: "Worker" },
    phone: { type: String },
    notes: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export const Team = models.Team || model("Team", TeamSchema);
