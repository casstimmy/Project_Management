import mongoose, { Schema, models } from "mongoose";

const AssetSchema = new Schema(
  {
    // Hierarchy references
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },
    facilitySpace: { type: Schema.Types.ObjectId, ref: "FacilitySpace" },

    // Identity
    name: { type: String, required: true, trim: true },
    assetTag: { type: String, unique: true, sparse: true, trim: true }, // Auto-generated
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "HVAC", "Electrical", "Plumbing", "Fire-Safety", "Security",
        "IT-Network", "Elevator", "Generator", "Furniture", "Appliance",
        "Structural", "Mechanical", "Other"
      ],
      default: "Other",
    },

    // Details
    model: { type: String, default: "" },
    serialNumber: { type: String, default: "" },
    internalRefNumber: { type: String, default: "" },
    manufacturer: { type: String, default: "" },

    // Dates & Lifecycle
    purchaseDate: { type: Date },
    purchaseCost: { type: Number, default: 0 },
    installationDate: { type: Date },
    warrantyDate: { type: Date },
    usefulLife: { type: Number, default: 0 }, // years
    replacementDueDate: { type: Date }, // auto-calculated
    replacementCost: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["in-service", "out-of-service", "disposed", "pending-installation"],
      default: "in-service",
    },

    // Condition
    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor", "Critical"],
      default: "Good",
    },
    conditionRating: { type: Number, min: 1, max: 5, default: 3 },

    // Maintenance
    maintenanceStrategy: {
      type: String,
      enum: ["RTF", "PPM", "PdM"],
      default: "RTF",
    },
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },

    // Depreciation
    depreciationMethod: {
      type: String,
      enum: ["straight-line", "declining-balance", "none"],
      default: "straight-line",
    },
    currentValue: { type: Number, default: 0 },
    salvageValue: { type: Number, default: 0 },

    // Media
    imageUrl: { type: String, default: "" },
    qrCode: { type: String, default: "" },
    documents: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Metadata
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate asset tag before saving
AssetSchema.pre("save", async function (next) {
  if (!this.assetTag) {
    const count = await mongoose.model("Asset").countDocuments();
    this.assetTag = `OPAL-AST-${String(count + 1).padStart(6, "0")}`;
  }
  // Auto-calculate replacement due date
  if (this.installationDate && this.usefulLife) {
    const repDate = new Date(this.installationDate);
    repDate.setFullYear(repDate.getFullYear() + this.usefulLife);
    this.replacementDueDate = repDate;
  }
  // Auto-calculate current value (straight-line depreciation)
  if (this.depreciationMethod === "straight-line" && this.purchaseCost && this.usefulLife) {
    const now = new Date();
    const purchaseDate = this.purchaseDate || this.createdAt || now;
    const yearsElapsed = (now - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
    const annualDepreciation = (this.purchaseCost - this.salvageValue) / this.usefulLife;
    this.currentValue = Math.max(
      this.salvageValue,
      this.purchaseCost - annualDepreciation * yearsElapsed
    );
  }
  next();
});

AssetSchema.index({ site: 1 });
AssetSchema.index({ building: 1 });
AssetSchema.index({ facilitySpace: 1 });
AssetSchema.index({ category: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ maintenanceStrategy: 1 });
AssetSchema.index({ replacementDueDate: 1 });

export default models.Asset || mongoose.model("Asset", AssetSchema);
