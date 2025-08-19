import mongoose from "mongoose";

const SpaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
}, { timestamps: true });

// Check if model already exists to prevent overwrite errors
const Space = mongoose.models.Space || mongoose.model("Space", SpaceSchema);

export default Space;
