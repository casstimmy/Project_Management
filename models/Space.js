import mongoose, { Schema, models } from "mongoose";

const spaceSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: String }, // optional: user ID or name
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

export default models.Space || mongoose.model("Space", spaceSchema);
