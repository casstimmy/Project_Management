/**
 * OPAL shire Constants
 */

export const APP_NAME = "OPAL Facility Management System";
export const APP_SHORT = "OPAL shire";

// Role labels
export const ROLE_LABELS = {
  admin: "Administrator",
  "facility-manager": "Facility Manager",
  technician: "Technician",
  auditor: "Auditor",
  "finance-officer": "Finance Officer",
  viewer: "Viewer",
};

// Asset categories
export const ASSET_CATEGORIES = [
  "HVAC", "Electrical", "Plumbing", "Fire-Safety", "Security",
  "IT-Network", "Elevator", "Generator", "Furniture", "Appliance",
  "Structural", "Mechanical", "Other",
];

// Maintenance strategies
export const MAINTENANCE_STRATEGIES = [
  { value: "RTF", label: "Run-to-Failure (RTF)" },
  { value: "PPM", label: "Planned Preventive Maintenance (PPM)" },
  { value: "PdM", label: "Predictive Maintenance (PdM)" },
];

// Condition ratings
export const CONDITION_RATINGS = [
  { value: 1, label: "Critical", color: "#EF4444" },
  { value: 2, label: "Poor", color: "#F97316" },
  { value: 3, label: "Fair", color: "#EAB308" },
  { value: 4, label: "Good", color: "#22C55E" },
  { value: 5, label: "Excellent", color: "#3B82F6" },
];

// FCA system classifications
export const FCA_SYSTEMS = [
  "Structural", "Mechanical", "Electrical", "Plumbing",
  "HVAC", "Fire-Safety", "Security", "IT-Network",
  "Roofing", "Flooring", "Exterior", "Interior", "Other",
];

// HSSE audit categories
export const HSSE_CATEGORIES = [
  "Fire Safety", "Electrical Safety", "Workplace Ergonomics",
  "Chemical Handling", "Emergency Exits", "First Aid",
  "PPE Compliance", "Housekeeping", "Signage",
  "Security Access", "CCTV", "Environmental",
];

// Risk levels
export const RISK_LEVELS = {
  Low: { color: "#22C55E", bg: "#F0FDF4" },
  Medium: { color: "#EAB308", bg: "#FEFCE8" },
  High: { color: "#F97316", bg: "#FFF7ED" },
  Extreme: { color: "#EF4444", bg: "#FEF2F2" },
};

// Budget categories
export const OPEX_CATEGORIES = [
  "Repairs", "Utilities", "Security", "Cleaning",
  "Diesel", "Internet", "Maintenance", "Waste", "Fleet",
];

export const CAPEX_CATEGORIES = [
  "Plant & Machinery", "Furniture & Fittings",
  "Equipment", "Buildings", "Appliances",
];

// Work order statuses
export const WO_STATUSES = [
  { value: "open", label: "Open", color: "#3B82F6" },
  { value: "assigned", label: "Assigned", color: "#8B5CF6" },
  { value: "in-progress", label: "In Progress", color: "#F59E0B" },
  { value: "on-hold", label: "On Hold", color: "#6B7280" },
  { value: "completed", label: "Completed", color: "#22C55E" },
  { value: "closed", label: "Closed", color: "#1F2937" },
  { value: "cancelled", label: "Cancelled", color: "#EF4444" },
];

// Priority colors
export const PRIORITY_COLORS = {
  low: { text: "#22C55E", bg: "#F0FDF4" },
  medium: { text: "#EAB308", bg: "#FEFCE8" },
  high: { text: "#F97316", bg: "#FFF7ED" },
  critical: { text: "#EF4444", bg: "#FEF2F2" },
};

// Months
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Dashboard color palette
export const CHART_COLORS = [
  "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#EC4899", "#F97316", "#14B8A6", "#6366F1",
];
