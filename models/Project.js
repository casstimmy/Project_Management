import mongoose, { Schema, models } from "mongoose";

const objectiveSchema = new Schema({ text: { type: String, required: true } });
const stakeholderSchema = new Schema({
  name: String,
  role: String,
  contact: String,
});
const responsibilitySchema = new Schema({
  role: String,
  responsibility: String,
});
const budgetSchema = new Schema({ category: String, amount: Number });
const approvalSchema = new Schema({ name: String, role: String, date: Date });

const projectSchema = new Schema(
  {
    space: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    title: { type: String, required: true },
    purpose: String,
    objectives: [objectiveSchema],
    scope: String,
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    stakeholders: [stakeholderSchema],
    responsibilities: [responsibilitySchema],
    budget: [budgetSchema],
    risks: String,
    assumptions: String,
    approvals: [approvalSchema],
  },
  { timestamps: true }
);

export default models.Project || mongoose.model("Project", projectSchema);
