// models/Project.js

import mongoose, { Schema, models } from "mongoose";

const objectiveSchema = new Schema({
  text: { type: String, required: true },
});

const stakeholderSchema = new Schema({
  name: String,
  role: String,
  contact: String,
});

const responsibilitySchema = new Schema({
  role: String,
  responsibility: String,
});

const budgetSchema = new Schema({
  category: String,
  amount: Number,
});

const approvalSchema = new Schema({
  name: String,
  role: String,
  date: Date,
});

const projectSchema = new Schema(
  {
    space: { type: String, required: true },
    title: { type: String, required: true },
    purpose: { type: String },
    objectives: [objectiveSchema],
    scope: { type: String },
    stakeholders: [stakeholderSchema],
    responsibilities: [responsibilitySchema],
    budget: [budgetSchema],
    risks: { type: String },
    assumptions: { type: String },
    approvals: [approvalSchema],
  },
  { timestamps: true }
);

export default models.Project || mongoose.model("Project", projectSchema);
