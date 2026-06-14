import { mongooseConnect } from "@/lib/mongoose";
import mongoose from "mongoose";
import Asset from "@/models/Asset";
import WorkOrder from "@/models/WorkOrder";
import Incident from "@/models/Incident";
import HSSEAudit from "@/models/HSSEAudit";
import FCAAssessment from "@/models/FCAAssessment";
import MaintenancePlan from "@/models/MaintenancePlan";
import Budget from "@/models/Budget";
import Site from "@/models/Site";
import { authenticate } from "@/lib/auth";
import { applyRateLimit, apiLimiter } from "@/lib/rateLimit";

// Per-section caches
let sectionCache = { summary: null, charts: null, recent: null };
let cacheTimestamps = { summary: 0, charts: 0, recent: 0 };
const CACHE_TTL = 30_000; // 30 seconds

async function ensureConnection() {
  await mongooseConnect();
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connection.asPromise();
  }
}

async function getSummary(currentDate, sixMonths) {
  const [assetStats, workOrderStats, openIncidents, highRiskIssues, totalSites, maintenanceDue] =
    await Promise.all([
      Asset.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            inService: [{ $match: { status: "in-service" } }, { $count: "count" }],
            nearReplacement: [
              { $match: { replacementDueDate: { $lte: sixMonths, $gte: currentDate } } },
              { $count: "count" },
            ],
          },
        },
      ]),
      WorkOrder.aggregate([
        {
          $facet: {
            active: [
              { $match: { status: { $in: ["open", "assigned", "in-progress"] } } },
              { $count: "count" },
            ],
            overdue: [
              { $match: { status: { $in: ["open", "assigned", "in-progress"] }, dueDate: { $lt: currentDate } } },
              { $count: "count" },
            ],
          },
        },
      ]),
      Incident.countDocuments({ status: { $in: ["reported", "investigating"] } }),
      HSSEAudit.aggregate([
        { $unwind: "$risks" },
        { $match: { "risks.riskLevel": { $in: ["High", "Extreme"] }, "risks.status": { $ne: "completed" } } },
        { $count: "count" },
      ]),
      Site.estimatedDocumentCount(),
      MaintenancePlan.countDocuments({
        nextDueDate: { $lte: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: "active",
      }),
    ]);

  const assets = assetStats[0] || {};
  const woStats = workOrderStats[0] || {};

  return {
    totalAssets: assets.total?.[0]?.count || 0,
    assetsInService: assets.inService?.[0]?.count || 0,
    assetsNearReplacement: assets.nearReplacement?.[0]?.count || 0,
    activeWorkOrders: woStats.active?.[0]?.count || 0,
    overdueWorkOrders: woStats.overdue?.[0]?.count || 0,
    openIncidents,
    highRiskIssues: highRiskIssues[0]?.count || 0,
    totalSites,
    maintenanceDue,
  };
}

async function getCharts(currentDate, startOfYear, sixMonths) {
  const [assetStats, workOrderStats, incidentsByType] = await Promise.all([
    Asset.aggregate([
      {
        $facet: {
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]),
    WorkOrder.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
          monthly: [
            { $match: { createdAt: { $gte: startOfYear } } },
            {
              $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 },
                totalCost: { $sum: "$totalCost" },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),
    Incident.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const woStats = workOrderStats[0] || {};
  const monthlyWorkOrders = woStats.monthly || [];
  const currentMonthWO = monthlyWorkOrders.find((m) => m._id === currentDate.getMonth() + 1);

  return {
    assetsByCategory: assetStats[0]?.byCategory || [],
    workOrdersByStatus: woStats.byStatus || [],
    workOrdersByPriority: woStats.byPriority || [],
    monthlyWorkOrders,
    incidentsByType,
    monthlyMaintenanceCost: currentMonthWO ? currentMonthWO.totalCost : 0,
  };
}

async function getRecent(currentDate) {
  const [recentFCA, recentAudits, budgetData] = await Promise.all([
    FCAAssessment.find()
      .sort({ assessmentDate: -1 })
      .limit(5)
      .select("title facilityConditionIndex building assessmentDate status")
      .populate("building", "name")
      .lean(),
    HSSEAudit.find()
      .sort({ auditDate: -1 })
      .limit(5)
      .select("title complianceScore building auditDate status")
      .populate("building", "name")
      .lean(),
    Budget.find({ fiscalYear: currentDate.getFullYear() })
      .select("budgetType totalBudgeted totalActual totalVariance title fiscalYear")
      .lean(),
  ]);

  const avgFCI = recentFCA.length > 0
    ? recentFCA.reduce((s, f) => s + (f.facilityConditionIndex || 0), 0) / recentFCA.length
    : 0;
  const avgCompliance = recentAudits.length > 0
    ? recentAudits.reduce((s, a) => s + (a.complianceScore || 0), 0) / recentAudits.length
    : 0;
  const totalBudgeted = budgetData.reduce((s, b) => s + (b.totalBudgeted || 0), 0);
  const totalActual = budgetData.reduce((s, b) => s + (b.totalActual || 0), 0);

  return {
    fcaAssessments: recentFCA,
    hsseAudits: recentAudits,
    budgets: budgetData,
    facilityConditionIndex: Math.round(avgFCI * 100) / 100,
    complianceScore: Math.round(avgCompliance),
    budgetVariance: totalBudgeted - totalActual,
    totalBudgeted,
    totalActual,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (!(await authenticate(req, res))) return;
  if (!applyRateLimit(req, res, apiLimiter, 60)) return;

  const forceFresh = req.query?.fresh === "1" || req.query?.fresh === "true";
  const section = req.query?.section; // "summary" | "charts" | "recent" | undefined (all)

  // Per-section cache check
  const now = Date.now();
  if (!forceFresh && section && sectionCache[section] && now - cacheTimestamps[section] < CACHE_TTL) {
    res.setHeader("X-Cache", "HIT");
    return res.json(sectionCache[section]);
  }

  await ensureConnection();

  try {
    const currentDate = new Date();
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    // Single section request — return just that section
    if (section === "summary") {
      const data = await getSummary(currentDate, sixMonths);
      sectionCache.summary = data;
      cacheTimestamps.summary = Date.now();
      res.setHeader("X-Cache", "MISS");
      return res.json(data);
    }

    if (section === "charts") {
      const data = await getCharts(currentDate, startOfYear, sixMonths);
      sectionCache.charts = data;
      cacheTimestamps.charts = Date.now();
      res.setHeader("X-Cache", "MISS");
      return res.json(data);
    }

    if (section === "recent") {
      const data = await getRecent(currentDate);
      sectionCache.recent = data;
      cacheTimestamps.recent = Date.now();
      res.setHeader("X-Cache", "MISS");
      return res.json(data);
    }

    // No section specified — return everything (backward compatible)
    const [summary, charts, recent] = await Promise.all([
      getSummary(currentDate, sixMonths),
      getCharts(currentDate, startOfYear, sixMonths),
      getRecent(currentDate),
    ]);

    const result = {
      summary: {
        ...summary,
        facilityConditionIndex: recent.facilityConditionIndex,
        complianceScore: recent.complianceScore,
        monthlyMaintenanceCost: charts.monthlyMaintenanceCost,
        budgetVariance: recent.budgetVariance,
        totalBudgeted: recent.totalBudgeted,
        totalActual: recent.totalActual,
      },
      charts: {
        assetsByCategory: charts.assetsByCategory,
        workOrdersByStatus: charts.workOrdersByStatus,
        workOrdersByPriority: charts.workOrdersByPriority,
        monthlyWorkOrders: charts.monthlyWorkOrders,
        incidentsByType: charts.incidentsByType,
      },
      recent: {
        fcaAssessments: recent.fcaAssessments,
        hsseAudits: recent.hsseAudits,
        budgets: recent.budgets,
      },
    };

    // Update all section caches
    sectionCache.summary = result.summary;
    sectionCache.charts = result.charts;
    sectionCache.recent = result.recent;
    cacheTimestamps.summary = cacheTimestamps.charts = cacheTimestamps.recent = Date.now();

    res.setHeader("X-Cache", "MISS");
    return res.json(result);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
