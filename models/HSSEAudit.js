import mongoose, { Schema, models } from "mongoose";

const ChecklistItemSchema = new Schema({
  category: { type: String, required: true },
  question: { type: String, required: true },
  response: { type: String, enum: ["yes", "no", "na", ""], default: "" },
  comments: { type: String, default: "" },
  photos: [{ url: String, caption: String }],
});

const RiskItemSchema = new Schema({
  hazard: { type: String, required: true },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  probability: { type: Number, min: 1, max: 5, required: true },
  severity: { type: Number, min: 1, max: 5, required: true },
  riskScore: { type: Number }, // probability * severity
  riskLevel: {
    type: String,
    enum: ["Low", "Medium", "High", "Extreme"],
  },
  recommendation: { type: String, default: "" },
  correctiveAction: { type: String, default: "" },
  assignedTo: { type: String, default: "" },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["open", "in-progress", "completed", "overdue"],
    default: "open",
  },
  completedDate: { type: Date },
});

// Auto-calculate risk score and level
RiskItemSchema.pre("validate", function (next) {
  this.riskScore = this.probability * this.severity;
  if (this.riskScore <= 4) this.riskLevel = "Low";
  else if (this.riskScore <= 9) this.riskLevel = "Medium";
  else if (this.riskScore <= 16) this.riskLevel = "High";
  else this.riskLevel = "Extreme";
  next();
});

const HSSEAuditSchema = new Schema(
  {
    // Reference
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },
    title: { type: String, required: true },
    auditDate: { type: Date, required: true, default: Date.now },
    auditor: { type: String, required: true },
    auditorId: { type: Schema.Types.ObjectId, ref: "User" },

    // Audit type
    auditType: {
      type: String,
      enum: ["health-safety", "security", "environment", "fire-safety", "comprehensive"],
      default: "comprehensive",
    },

    // Checklist
    checklist: [ChecklistItemSchema],

    // Risk Assessment
    risks: [RiskItemSchema],

    // Scoring
    totalQuestions: { type: Number, default: 0 },
    compliantCount: { type: Number, default: 0 },
    nonCompliantCount: { type: Number, default: 0 },
    complianceScore: { type: Number, default: 0 }, // percentage

    // PPE Tracking
    ppeItems: [
      {
        item: String,
        available: { type: Boolean, default: false },
        condition: { type: String, enum: ["good", "fair", "poor", "replace"], default: "good" },
        expiryDate: Date,
        quantity: { type: Number, default: 0 },
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["draft", "in-progress", "completed", "approved"],
      default: "draft",
    },

    // Summary
    findings: { type: String, default: "" },
    recommendations: { type: String, default: "" },
    reportUrl: { type: String, default: "" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calculate compliance score
HSSEAuditSchema.pre("save", function (next) {
  if (this.checklist && this.checklist.length > 0) {
    const answered = this.checklist.filter((c) => c.response !== "" && c.response !== "na");
    this.totalQuestions = answered.length;
    this.compliantCount = answered.filter((c) => c.response === "yes").length;
    this.nonCompliantCount = answered.filter((c) => c.response === "no").length;
    this.complianceScore =
      this.totalQuestions > 0
        ? Math.round((this.compliantCount / this.totalQuestions) * 100)
        : 0;
  }
  next();
});

HSSEAuditSchema.index({ site: 1 });
HSSEAuditSchema.index({ building: 1 });
HSSEAuditSchema.index({ auditDate: -1 });
HSSEAuditSchema.index({ status: 1 });

export default models.HSSEAudit || mongoose.model("HSSEAudit", HSSEAuditSchema);
