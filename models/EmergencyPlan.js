import mongoose, { Schema, models } from "mongoose";

const EmergencyContactSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String },
  organization: { type: String },
  phone: { type: String },
  email: { type: String },
  type: { type: String, enum: ["internal", "external"], default: "internal" },
});

const RiskAssessmentSchema = new Schema({
  risk: { type: String, required: true },
  likelihood: { type: Number, min: 1, max: 5, default: 3 },
  impact: { type: Number, min: 1, max: 5, default: 3 },
  riskPriority: { type: Number }, // likelihood * impact
  mitigationStrategy: { type: String, default: "" },
  responsiblePerson: { type: String, default: "" },
});

RiskAssessmentSchema.pre("validate", function (next) {
  this.riskPriority = this.likelihood * this.impact;
  next();
});

const BIAItemSchema = new Schema({
  process: { type: String, required: true },
  description: { type: String, default: "" },
  criticality: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  rto: { type: Number, default: 0 }, // Recovery Time Objective in hours
  rpo: { type: Number, default: 0 }, // Recovery Point Objective in hours
  maxDowntime: { type: Number, default: 0 }, // hours
  financialImpact: { type: Number, default: 0 }, // per hour
  dependencies: [String],
  recoveryStrategy: { type: String, default: "" },
});

const DrillLogSchema = new Schema({
  drillType: { type: String, required: true },
  date: { type: Date, required: true },
  participants: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // minutes
  scenario: { type: String, default: "" },
  observations: { type: String, default: "" },
  improvements: { type: String, default: "" },
  conductedBy: { type: String, default: "" },
  passed: { type: Boolean, default: true },
});

const EmergencyPlanSchema = new Schema(
  {
    site: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    title: { type: String, required: true },
    version: { type: String, default: "1.0" },
    status: {
      type: String,
      enum: ["draft", "active", "under-review", "archived"],
      default: "draft",
    },

    // Risk Assessment
    risks: [RiskAssessmentSchema],

    // Business Impact Analysis
    biaItems: [BIAItemSchema],

    // Response Plans
    incidentResponsePlan: { type: String, default: "" },
    evacuationProcedure: { type: String, default: "" },
    assemblyPoints: [{ name: String, location: String }],

    // Roles & Responsibilities
    roles: [
      {
        title: String,
        person: String,
        responsibilities: [String],
        contact: String,
      },
    ],

    // Contacts
    contacts: [EmergencyContactSchema],

    // Recovery
    recoveryPlan: { type: String, default: "" },
    recoveryPriorities: [{ priority: Number, process: String, rto: Number }],

    // Drills
    drillLogs: [DrillLogSchema],
    nextDrillDate: { type: Date },

    // Documents
    documents: [{ name: String, url: String, type: String }],
    reportUrl: { type: String, default: "" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedDate: { type: Date },
  },
  { timestamps: true }
);

EmergencyPlanSchema.index({ site: 1 });
EmergencyPlanSchema.index({ status: 1 });

export default models.EmergencyPlan || mongoose.model("EmergencyPlan", EmergencyPlanSchema);
