import mongoose, { Schema, models } from "mongoose";

const WorkOrderSchema = new Schema(
  {
    // Reference
    asset: { type: Schema.Types.ObjectId, ref: "Asset" },
    maintenancePlan: { type: Schema.Types.ObjectId, ref: "MaintenancePlan" },
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },

    // Identity
    workOrderNumber: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },

    // Type
    type: {
      type: String,
      enum: ["preventive", "predictive", "reactive", "emergency", "inspection"],
      default: "reactive",
    },

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Assignment
    requestedBy: { type: String, default: "" },
    requestedById: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: String, default: "" },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User" },

    // Dates
    requestDate: { type: Date, default: Date.now },
    scheduledDate: { type: Date },
    startDate: { type: Date },
    completedDate: { type: Date },
    dueDate: { type: Date },

    // Time tracking
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    downtime: { type: Number, default: 0 }, // hours

    // Cost
    laborCost: { type: Number, default: 0 },
    materialCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    // Materials used
    materials: [
      {
        item: String,
        quantity: Number,
        unitCost: Number,
        totalCost: Number,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["open", "assigned", "in-progress", "on-hold", "completed", "closed", "cancelled"],
      default: "open",
    },

    // Notes & comments
    notes: { type: String, default: "" },
    resolution: { type: String, default: "" },
    comments: [
      {
        user: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Documents & photos
    photos: [{ url: String, caption: String }],
    documents: [{ name: String, url: String }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate work order number
WorkOrderSchema.pre("save", async function (next) {
  if (!this.workOrderNumber) {
    const count = await mongoose.model("WorkOrder").countDocuments();
    this.workOrderNumber = `WO-${String(count + 1).padStart(6, "0")}`;
  }
  this.totalCost = this.laborCost + this.materialCost;
  next();
});

WorkOrderSchema.index({ asset: 1 });
WorkOrderSchema.index({ status: 1 });
WorkOrderSchema.index({ priority: 1 });
WorkOrderSchema.index({ assignedToId: 1 });
WorkOrderSchema.index({ scheduledDate: 1 });
WorkOrderSchema.index({ workOrderNumber: 1 });

export default models.WorkOrder || mongoose.model("WorkOrder", WorkOrderSchema);
