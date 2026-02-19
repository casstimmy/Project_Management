import mongoose, { Schema, models } from "mongoose";

const BudgetLineItemSchema = new Schema({
  category: { type: String, required: true },
  subCategory: { type: String, default: "" },
  description: { type: String, default: "" },
  budgetedAmount: { type: Number, default: 0 },
  actualAmount: { type: Number, default: 0 },
  variance: { type: Number, default: 0 }, // budgeted - actual
  variancePercent: { type: Number, default: 0 },
  month: { type: Number, min: 1, max: 12 },
  notes: { type: String, default: "" },
});

BudgetLineItemSchema.pre("validate", function (next) {
  this.variance = this.budgetedAmount - this.actualAmount;
  this.variancePercent =
    this.budgetedAmount > 0
      ? Math.round((this.variance / this.budgetedAmount) * 100)
      : 0;
  next();
});

const BudgetSchema = new Schema(
  {
    site: { type: Schema.Types.ObjectId, ref: "Site" },
    building: { type: Schema.Types.ObjectId, ref: "Building" },
    title: { type: String, required: true },
    fiscalYear: { type: Number, required: true },
    description: { type: String, default: "" },

    // Type
    budgetType: {
      type: String,
      enum: ["OPEX", "CAPEX"],
      required: true,
    },

    // OPEX Categories
    // Repairs, Utilities, Security, Cleaning, Diesel, Internet, Maintenance, Waste, Fleet
    // CAPEX Categories
    // Plant & Machinery, Furniture & Fittings, Equipment, Buildings, Appliances

    // Line items
    lineItems: [BudgetLineItemSchema],

    // Summary (auto-calculated)
    totalBudgeted: { type: Number, default: 0 },
    totalActual: { type: Number, default: 0 },
    totalVariance: { type: Number, default: 0 },

    // Cost center
    costCenter: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "closed"],
      default: "draft",
    },

    // Approval
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedDate: { type: Date },

    // Documents
    documents: [{ name: String, url: String }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calculate totals
BudgetSchema.pre("save", function (next) {
  if (this.lineItems && this.lineItems.length > 0) {
    this.totalBudgeted = this.lineItems.reduce((s, i) => s + (i.budgetedAmount || 0), 0);
    this.totalActual = this.lineItems.reduce((s, i) => s + (i.actualAmount || 0), 0);
    this.totalVariance = this.totalBudgeted - this.totalActual;
  }
  next();
});

BudgetSchema.index({ site: 1 });
BudgetSchema.index({ fiscalYear: 1 });
BudgetSchema.index({ budgetType: 1 });
BudgetSchema.index({ status: 1 });

export default models.Budget || mongoose.model("Budget", BudgetSchema);
