import mongoose, { Schema, models } from "mongoose";

const DefectSchema = new Schema({
  location: { type: String },
  system: {
    type: String,
    enum: [
      "Structural", "Mechanical", "Electrical", "Plumbing",
      "HVAC", "Fire-Safety", "Security", "IT-Network",
      "Roofing", "Flooring", "Exterior", "Interior", "Other"
    ],
  },
  description: { type: String, required: true },
  conditionRating: { type: Number, min: 1, max: 5, required: true },
  repairScope: { type: String },
  estimatedCost: { type: Number, default: 0 },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  photos: [{ url: String, caption: String, uploadedAt: { type: Date, default: Date.now } }],
  status: {
    type: String,
    enum: ["identified", "scheduled", "in-progress", "completed", "deferred"],
    default: "identified",
  },
});

const FCAAssessmentSchema = new Schema(
  {
    // Reference
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building", required: true },
    assessmentDate: { type: Date, required: true, default: Date.now },
    assessor: { type: String, required: true },
    assessorId: { type: Schema.Types.ObjectId, ref: "User" },

    // Assessment data
    title: { type: String, required: true },
    description: { type: String, default: "" },

    // Overall ratings
    overallConditionRating: { type: Number, min: 1, max: 5 },
    currentReplacementValue: { type: Number, default: 0 }, // CRV
    totalDeficiencyCost: { type: Number, default: 0 },
    facilityConditionIndex: { type: Number, default: 0 }, // FCI = deficiency / CRV

    // Defects
    defects: [DefectSchema],

    // System ratings
    systemRatings: [
      {
        system: String,
        rating: { type: Number, min: 1, max: 5 },
        notes: String,
        estimatedCost: { type: Number, default: 0 },
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["draft", "in-progress", "completed", "approved"],
      default: "draft",
    },

    // Report
    reportUrl: { type: String, default: "" },
    recommendations: { type: String, default: "" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calculate FCI before saving
FCAAssessmentSchema.pre("save", function (next) {
  if (this.defects && this.defects.length > 0) {
    this.totalDeficiencyCost = this.defects.reduce(
      (sum, d) => sum + (d.estimatedCost || 0),
      0
    );
  }
  if (this.currentReplacementValue > 0) {
    this.facilityConditionIndex =
      this.totalDeficiencyCost / this.currentReplacementValue;
  }
  next();
});

FCAAssessmentSchema.index({ building: 1 });
FCAAssessmentSchema.index({ assessmentDate: -1 });
FCAAssessmentSchema.index({ status: 1 });

export default models.FCAAssessment || mongoose.model("FCAAssessment", FCAAssessmentSchema);
