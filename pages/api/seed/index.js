/**
 * Seed / demo-data API for the OPAL Facility Management System.
 *
 *   POST   /api/seed   -> populate the database with the demo dataset
 *   DELETE /api/seed   -> remove ONLY the demo dataset (safe: scoped to demo sites)
 *   GET    /api/seed   -> report how many demo records currently exist
 *
 * The dataset is defined in /lib/seedData.js and linked together using readable
 * `code` fields which are resolved to real ObjectIds here.
 */
import bcrypt from "bcrypt";
import { mongooseConnect } from "@/lib/mongoose";
import { authenticate } from "@/lib/auth";

import User from "@/models/User";
import { Team } from "@/models/Team";
import Site from "@/models/Site";
import Building from "@/models/Building";
import FacilitySpace from "@/models/FacilitySpace";
import Asset from "@/models/Asset";
import MaintenancePlan from "@/models/MaintenancePlan";
import WorkOrder from "@/models/WorkOrder";
import Incident from "@/models/Incident";
import HSSEAudit from "@/models/HSSEAudit";
import EmergencyPlan from "@/models/EmergencyPlan";
import FCAAssessment from "@/models/FCAAssessment";
import Budget from "@/models/Budget";
import GovernanceDoc from "@/models/GovernanceDoc";
import Drawing from "@/models/Drawing";

import {
  SEED_USERS, SEED_TEAM, SEED_SITES, SEED_BUILDINGS, SEED_SPACES, SEED_ASSETS,
  SEED_MAINTENANCE, SEED_WORKORDERS, SEED_INCIDENTS, SEED_HSSE, SEED_EMERGENCY,
  SEED_FCA, SEED_BUDGETS, SEED_GOVERNANCE, SEED_DRAWINGS, SEED_DEFAULT_PASSWORD,
  SEED_HELPERS,
} from "@/lib/seedData";

const { addDays, yearsAgo } = SEED_HELPERS;
const PLACEHOLDER_FILE = "https://example.com/opal-demo/drawing-placeholder.pdf";

const SITE_CODES = SEED_SITES.map((s) => s.siteCode);
const DRAWING_TITLES = SEED_DRAWINGS.map((d) => d.title);

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

  await mongooseConnect();
  const createdBy = user.id || null;

  try {
    if (req.method === "GET") {
      return res.json(await countDemo());
    }

    if (req.method === "DELETE") {
      const removed = await clearDemo();
      return res.json({ message: "Demo data removed.", removed });
    }

    if (req.method === "POST") {
      const existing = await Site.countDocuments({ code: { $in: SITE_CODES } });
      if (existing > 0 && !req.body?.force) {
        return res.status(409).json({
          error: "Demo data already exists. Clear it first, or resend with { force: true } to replace it.",
        });
      }
      if (existing > 0 && req.body?.force) {
        await clearDemo();
      }

      const created = await seedAll(createdBy);
      return res.status(201).json({ message: "Demo data created.", created });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error("Seed error:", err);
    return res.status(500).json({ error: err.message || "Seeding failed" });
  }
}

/* ──────────────────────────────── COUNT ──────────────────────────────── */
async function getDemoSiteIds() {
  const sites = await Site.find({ code: { $in: SITE_CODES } }).select("_id");
  return sites.map((s) => s._id);
}

async function countDemo() {
  const siteIds = await getDemoSiteIds();
  const buildings = await Building.find({ site: { $in: siteIds } }).select("_id");
  const buildingIds = buildings.map((b) => b._id);
  const assets = await Asset.find({ site: { $in: siteIds } }).select("_id");
  const assetIds = assets.map((a) => a._id);

  return {
    users: await User.countDocuments({ email: { $regex: "@opal.test$" } }),
    team: await Team.countDocuments({ email: { $regex: "@opal.test$" } }),
    sites: siteIds.length,
    buildings: buildingIds.length,
    spaces: await FacilitySpace.countDocuments({ building: { $in: buildingIds } }),
    assets: assetIds.length,
    maintenance: await MaintenancePlan.countDocuments({ asset: { $in: assetIds } }),
    workorders: await WorkOrder.countDocuments({ site: { $in: siteIds } }),
    incidents: await Incident.countDocuments({ site: { $in: siteIds } }),
    hsse: await HSSEAudit.countDocuments({ site: { $in: siteIds } }),
    emergency: await EmergencyPlan.countDocuments({ site: { $in: siteIds } }),
    fca: await FCAAssessment.countDocuments({ site: { $in: siteIds } }),
    budgets: await Budget.countDocuments({ site: { $in: siteIds } }),
    governance: await GovernanceDoc.countDocuments({ site: { $in: siteIds } }),
    drawings: await Drawing.countDocuments({ title: { $in: DRAWING_TITLES } }),
  };
}

/* ──────────────────────────────── CLEAR ──────────────────────────────── */
async function clearDemo() {
  const siteIds = await getDemoSiteIds();
  const buildings = await Building.find({ site: { $in: siteIds } }).select("_id");
  const buildingIds = buildings.map((b) => b._id);
  const assets = await Asset.find({ site: { $in: siteIds } }).select("_id");
  const assetIds = assets.map((a) => a._id);

  const removed = {};
  removed.maintenance = (await MaintenancePlan.deleteMany({ asset: { $in: assetIds } })).deletedCount;
  removed.workorders = (await WorkOrder.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.assets = (await Asset.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.spaces = (await FacilitySpace.deleteMany({ building: { $in: buildingIds } })).deletedCount;
  removed.incidents = (await Incident.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.hsse = (await HSSEAudit.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.emergency = (await EmergencyPlan.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.fca = (await FCAAssessment.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.budgets = (await Budget.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.governance = (await GovernanceDoc.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.buildings = (await Building.deleteMany({ site: { $in: siteIds } })).deletedCount;
  removed.sites = (await Site.deleteMany({ code: { $in: SITE_CODES } })).deletedCount;
  removed.drawings = (await Drawing.deleteMany({ title: { $in: DRAWING_TITLES } })).deletedCount;
  removed.team = (await Team.deleteMany({ email: { $regex: "@opal.test$" } })).deletedCount;
  removed.users = (await User.deleteMany({ email: { $regex: "@opal.test$" } })).deletedCount;
  return removed;
}

/* ──────────────────────────────── SEED ──────────────────────────────── */
async function seedAll(createdBy) {
  const created = {};

  // 1. Users
  const hashed = await bcrypt.hash(SEED_DEFAULT_PASSWORD, 10);
  const userMap = {};
  for (const u of SEED_USERS) {
    let doc = await User.findOne({ email: u.email });
    if (!doc) {
      doc = await User.create({
        name: u.name, email: u.email, password: hashed,
        role: u.role, department: u.department, phone: u.phone, isActive: true,
      });
    }
    userMap[u.code] = doc._id;
  }
  created.users = Object.keys(userMap).length;

  // 2. Team
  let teamCount = 0;
  for (const t of SEED_TEAM) {
    await Team.create({ name: t.name, email: t.email, role: t.role, type: t.type, phone: t.phone, notes: t.notes });
    teamCount++;
  }
  created.team = teamCount;

  // 3. Sites
  const siteMap = {};
  for (const s of SEED_SITES) {
    const doc = await Site.create({
      name: s.name, code: s.siteCode, status: s.status, totalArea: s.totalArea,
      description: s.description, contactPerson: s.contactPerson, contactPhone: s.contactPhone,
      contactEmail: s.contactEmail,
      address: { street: s.street, city: s.city, state: s.state, country: s.country },
      createdBy,
    });
    siteMap[s.code] = doc._id;
  }
  created.sites = Object.keys(siteMap).length;

  // 4. Buildings
  const buildingMap = {};
  for (const b of SEED_BUILDINGS) {
    const doc = await Building.create({
      site: siteMap[b.site], name: b.name, code: b.buildingCode, type: b.type,
      floors: b.floors, totalArea: b.totalArea, yearBuilt: b.yearBuilt, status: b.status,
      description: b.description, createdBy,
    });
    buildingMap[b.code] = doc._id;
    await Site.findByIdAndUpdate(siteMap[b.site], { $push: { buildings: doc._id } });
  }
  created.buildings = Object.keys(buildingMap).length;

  // 5. Spaces
  const spaceMap = {};
  for (const sp of SEED_SPACES) {
    const doc = await FacilitySpace.create({
      building: buildingMap[sp.building], name: sp.name, code: sp.spaceCode,
      floor: sp.floor, type: sp.type, area: sp.area, capacity: sp.capacity,
      status: sp.status, createdBy,
    });
    spaceMap[sp.code] = doc._id;
    await Building.findByIdAndUpdate(buildingMap[sp.building], { $push: { spaces: doc._id } });
  }
  created.spaces = Object.keys(spaceMap).length;

  // 6. Assets
  const assetMap = {};
  for (const a of SEED_ASSETS) {
    const installation = yearsAgo(a.purchaseYearsAgo || 0);
    const doc = await Asset.create({
      site: siteMap[a.site], building: buildingMap[a.building],
      facilitySpace: a.space ? spaceMap[a.space] : undefined,
      name: a.name, category: a.category, manufacturer: a.manufacturer, model: a.model,
      serialNumber: a.serialNumber, purchaseCost: a.purchaseCost, replacementCost: a.replacementCost,
      usefulLife: a.usefulLife, status: a.status, condition: a.condition,
      conditionRating: a.conditionRating, maintenanceStrategy: a.maintenanceStrategy,
      purchaseDate: installation, installationDate: installation,
      depreciationMethod: "straight-line", salvageValue: Math.round(a.purchaseCost * 0.1),
      createdBy,
    });
    assetMap[a.code] = doc._id;
    if (a.space) await FacilitySpace.findByIdAndUpdate(spaceMap[a.space], { $push: { assets: doc._id } });
  }
  created.assets = Object.keys(assetMap).length;

  // 7. Maintenance plans
  let maintCount = 0;
  for (const m of SEED_MAINTENANCE) {
    await MaintenancePlan.create({
      asset: assetMap[m.asset], site: siteMap[m.site], building: buildingMap[m.building],
      title: m.title, maintenanceType: m.maintenanceType, frequency: m.frequency,
      priority: m.priority, status: m.status, estimatedCost: m.estimatedCost,
      actualCost: m.actualCost, assignedTo: m.assignedTo,
      startDate: yearsAgo(1), nextDueDate: addDays(m.nextDueInDays),
      tasks: (m.tasks || []).map((task) => ({ task, completed: false })),
      createdBy,
    });
    maintCount++;
  }
  created.maintenance = maintCount;

  // 8. Work orders
  let woCount = 0;
  for (const w of SEED_WORKORDERS) {
    await WorkOrder.create({
      asset: assetMap[w.asset], site: siteMap[w.site], building: buildingMap[w.building],
      title: w.title, description: w.description, type: w.type, priority: w.priority,
      status: w.status, requestedBy: w.requestedBy, assignedTo: w.assignedTo,
      laborCost: w.laborCost, materialCost: w.materialCost,
      estimatedHours: w.estimatedHours, actualHours: w.actualHours || 0,
      scheduledDate: addDays(w.scheduledInDays),
      completedDate: w.completedInDays != null ? addDays(w.completedInDays) : undefined,
      createdBy,
    });
    woCount++;
  }
  created.workorders = woCount;

  // 9. Incidents
  let incCount = 0;
  for (const i of SEED_INCIDENTS) {
    await Incident.create({
      site: siteMap[i.site], building: buildingMap[i.building],
      title: i.title, description: i.description, type: i.type, severity: i.severity,
      status: i.status, location: i.location, reportedBy: i.reportedBy,
      incidentDate: addDays(i.occurredInDays),
      immediateAction: i.immediateAction, rootCause: i.rootCause,
      correctiveAction: i.correctiveAction, preventiveAction: i.preventiveAction,
      createdBy,
    });
    incCount++;
  }
  created.incidents = incCount;

  // 10. HSSE audits
  let hsseCount = 0;
  for (const h of SEED_HSSE) {
    const compliant = h.checklist.filter((c) => c.response === "yes").length;
    const nonCompliant = h.checklist.filter((c) => c.response === "no").length;
    const total = h.checklist.length;
    await HSSEAudit.create({
      site: siteMap[h.site], building: buildingMap[h.building],
      title: h.title, auditType: h.auditType, auditor: h.auditor, status: h.status,
      auditDate: addDays(h.auditedInDays),
      checklist: h.checklist,
      risks: h.risks,
      totalQuestions: total, compliantCount: compliant, nonCompliantCount: nonCompliant,
      complianceScore: total ? Math.round((compliant / total) * 100) : 0,
      createdBy,
    });
    hsseCount++;
  }
  created.hsse = hsseCount;

  // 11. Emergency plans
  let emCount = 0;
  for (const e of SEED_EMERGENCY) {
    await EmergencyPlan.create({
      site: siteMap[e.site], title: e.title, version: e.version, status: e.status,
      incidentResponsePlan: e.incidentResponsePlan, evacuationProcedure: e.evacuationProcedure,
      assemblyPoints: e.assemblyPoints, contacts: e.contacts,
      drillLogs: (e.drills || []).map((d) => ({
        drillType: d.drillType, date: addDays(d.inDays), participants: d.participants,
        duration: d.duration, scenario: d.scenario, observations: d.observations,
        passed: d.passed, conductedBy: d.conductedBy,
      })),
      createdBy,
    });
    emCount++;
  }
  created.emergency = emCount;

  // 12. FCA assessments
  let fcaCount = 0;
  for (const f of SEED_FCA) {
    await FCAAssessment.create({
      site: siteMap[f.site], building: buildingMap[f.building],
      title: f.title, assessor: f.assessor, status: f.status,
      assessmentDate: addDays(f.assessedInDays),
      currentReplacementValue: f.currentReplacementValue,
      systemRatings: f.systemRatings, defects: f.defects,
      recommendations: f.recommendations, createdBy,
    });
    fcaCount++;
  }
  created.fca = fcaCount;

  // 13. Budgets
  let budCount = 0;
  for (const b of SEED_BUDGETS) {
    await Budget.create({
      site: siteMap[b.site], title: b.title, budgetType: b.budgetType,
      fiscalYear: b.fiscalYear, status: b.status, costCenter: b.costCenter,
      lineItems: b.lineItems, createdBy,
    });
    budCount++;
  }
  created.budgets = budCount;

  // 14. Governance docs
  let govCount = 0;
  for (const g of SEED_GOVERNANCE) {
    await GovernanceDoc.create({
      site: siteMap[g.site], title: g.title, type: g.type, status: g.status,
      reference: g.reference, value: g.value, parties: g.parties,
      description: g.description, serviceLevel: g.serviceLevel, responseTime: g.responseTime,
      penalties: g.penalties,
      startDate: g.startYearsAgo != null ? yearsAgo(g.startYearsAgo) : undefined,
      endDate: g.endInDays != null ? addDays(g.endInDays) : undefined,
      createdBy,
    });
    govCount++;
  }
  created.governance = govCount;

  // 15. Drawings
  let drwCount = 0;
  for (const d of SEED_DRAWINGS) {
    await Drawing.create({
      title: d.title, category: d.category, description: d.description,
      fileUrl: PLACEHOLDER_FILE, fileName: d.fileName, fileType: "application/pdf",
      uploadedBy: createdBy,
    });
    drwCount++;
  }
  created.drawings = drwCount;

  return created;
}
