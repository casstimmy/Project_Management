import jwt from "jsonwebtoken";

/**
 * Authentication middleware for API routes
 * Usage: const user = await authenticate(req, res); if (!user) return;
 */
export async function authenticate(req, res) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  try {
    const token = authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
}

/**
 * Role-based authorization middleware
 * Usage: const user = await authorize(req, res, ["admin", "facility-manager"]); if (!user) return;
 */
export async function authorize(req, res, allowedRoles = []) {
  const user = await authenticate(req, res);
  if (!user) return null;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    res.status(403).json({ error: "Insufficient permissions" });
    return null;
  }

  return user;
}

/**
 * Permission matrix for RBAC
 */
export const PERMISSIONS = {
  // Assets
  "assets.view": ["admin", "facility-manager", "technician", "auditor", "finance-officer", "viewer"],
  "assets.create": ["admin", "facility-manager"],
  "assets.edit": ["admin", "facility-manager"],
  "assets.delete": ["admin"],

  // FCA
  "fca.view": ["admin", "facility-manager", "auditor", "viewer"],
  "fca.create": ["admin", "facility-manager", "auditor"],
  "fca.edit": ["admin", "facility-manager", "auditor"],
  "fca.approve": ["admin", "facility-manager"],

  // HSSE
  "hsse.view": ["admin", "facility-manager", "auditor", "viewer"],
  "hsse.create": ["admin", "facility-manager", "auditor"],
  "hsse.edit": ["admin", "facility-manager", "auditor"],

  // Incidents
  "incidents.view": ["admin", "facility-manager", "auditor", "technician", "viewer"],
  "incidents.create": ["admin", "facility-manager", "auditor", "technician"],
  "incidents.edit": ["admin", "facility-manager", "auditor"],

  // Emergency
  "emergency.view": ["admin", "facility-manager", "auditor", "viewer"],
  "emergency.create": ["admin", "facility-manager"],
  "emergency.edit": ["admin", "facility-manager"],

  // Maintenance
  "maintenance.view": ["admin", "facility-manager", "technician", "viewer"],
  "maintenance.create": ["admin", "facility-manager", "technician"],
  "maintenance.edit": ["admin", "facility-manager", "technician"],

  // Work Orders
  "workorders.view": ["admin", "facility-manager", "technician", "viewer"],
  "workorders.create": ["admin", "facility-manager", "technician"],
  "workorders.edit": ["admin", "facility-manager", "technician"],
  "workorders.close": ["admin", "facility-manager"],

  // Budget
  "budget.view": ["admin", "facility-manager", "finance-officer", "viewer"],
  "budget.create": ["admin", "finance-officer"],
  "budget.edit": ["admin", "finance-officer"],
  "budget.approve": ["admin"],

  // Users
  "users.view": ["admin"],
  "users.create": ["admin"],
  "users.edit": ["admin"],
  "users.delete": ["admin"],

  // Reports
  "reports.view": ["admin", "facility-manager", "auditor", "finance-officer", "viewer"],
  "reports.generate": ["admin", "facility-manager", "auditor", "finance-officer"],

  // Settings
  "settings.view": ["admin"],
  "settings.edit": ["admin"],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}
