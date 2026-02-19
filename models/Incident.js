import mongoose, { Schema, models } from "mongoose";

const IncidentSchema = new Schema(
  {
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    incidentDate: { type: Date, required: true, default: Date.now },
    reportedBy: { type: String, required: true },
    reportedById: { type: Schema.Types.ObjectId, ref: "User" },

    type: {
      type: String,
      enum: [
        "injury", "near-miss", "property-damage", "fire",
        "environmental", "security-breach", "equipment-failure", "other"
      ],
      default: "other",
    },

    severity: {
      type: String,
      enum: ["minor", "moderate", "major", "critical"],
      default: "minor",
    },

    location: { type: String, default: "" },
    involvedPersons: [{ name: String, role: String, contact: String }],

    immediateAction: { type: String, default: "" },
    rootCause: { type: String, default: "" },
    correctiveAction: { type: String, default: "" },
    preventiveAction: { type: String, default: "" },

    photos: [{ url: String, caption: String, uploadedAt: { type: Date, default: Date.now } }],
    documents: [{ name: String, url: String }],

    status: {
      type: String,
      enum: ["reported", "investigating", "resolved", "closed"],
      default: "reported",
    },

    investigator: { type: String, default: "" },
    investigatorId: { type: Schema.Types.ObjectId, ref: "User" },
    closedDate: { type: Date },
    closedBy: { type: Schema.Types.ObjectId, ref: "User" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

IncidentSchema.index({ site: 1 });
IncidentSchema.index({ type: 1 });
IncidentSchema.index({ severity: 1 });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ incidentDate: -1 });

export default models.Incident || mongoose.model("Incident", IncidentSchema);
