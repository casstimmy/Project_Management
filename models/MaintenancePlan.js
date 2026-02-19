import mongoose, { Schema, models } from "mongoose";

const MaintenancePlanSchema = new Schema(
  {
    // Reference
    asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },

    title: { type: String, required: true },
    description: { type: String, default: "" },

    // Type
    maintenanceType: {
      type: String,
      enum: ["PPM", "PdM", "RTF"],
      required: true,
    },

    // Schedule
    frequency: {
      type: String,
      enum: ["daily", "weekly", "bi-weekly", "monthly", "quarterly", "semi-annual", "annual", "custom"],
      default: "monthly",
    },
    customIntervalDays: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextDueDate: { type: Date },
    lastCompletedDate: { type: Date },

    // Assignment
    assignedTo: { type: String, default: "" },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User" },
    team: { type: String, default: "" },

    // Tasks within the plan
    tasks: [
      {
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedDate: { type: Date },
        notes: { type: String, default: "" },
      },
    ],

    // Cost
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Documents
    documents: [{ name: String, url: String }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MaintenancePlanSchema.index({ asset: 1 });
MaintenancePlanSchema.index({ maintenanceType: 1 });
MaintenancePlanSchema.index({ status: 1 });
MaintenancePlanSchema.index({ nextDueDate: 1 });

export default models.MaintenancePlan || mongoose.model("MaintenancePlan", MaintenancePlanSchema);
