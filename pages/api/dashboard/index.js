import { mongooseConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";
import WorkOrder from "@/models/WorkOrder";
import Incident from "@/models/Incident";
import HSSEAudit from "@/models/HSSEAudit";
import FCAAssessment from "@/models/FCAAssessment";
import MaintenancePlan from "@/models/MaintenancePlan";
import Budget from "@/models/Budget";
import Site from "@/models/Site";
import { applyRateLimit, apiLimiter } from "@/lib/rateLimit";

// Server-side cache: stores dashboard result + timestamp
let dashboardCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30_000; // 30 seconds

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Apply rate limiting (60 requests per minute per IP)
  if (!applyRateLimit(req, res, apiLimiter, 60)) return;

  // Return cached data if still fresh
  const now = Date.now();
  if (dashboardCache.data && now - dashboardCache.timestamp < CACHE_TTL) {
    res.setHeader("X-Cache", "HIT");
    return res.json(dashboardCache.data);
  }

  await mongooseConnect();

  try {
    const currentDate = new Date();
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    // Batch 1: Simple counts (combined into fewer aggregations where possible)
    const [
      assetStats,
      workOrderStats,
      openIncidents,
      highRiskIssues,
      totalSites,
      maintenanceDue,
    ] = await Promise.all([
      // Single aggregation for all asset counts + category breakdown
      Asset.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            inService: [{ $match: { status: "in-service" } }, { $count: "count" }],
            nearReplacement: [
              { $match: { replacementDueDate: { $lte: sixMonths, $gte: currentDate } } },
              { $count: "count" },
            ],
            byCategory: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),
      // Single aggregation for all work order stats
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

    // Batch 2: Document fetches (with lean() for performance)
    const [recentFCA, recentAudits, budgetData, incidentsByType] = await Promise.all([
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
        .select("budgetType totalBudgeted totalActual totalVariance title")
        .lean(),
      Incident.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Extract faceted results
    const assets = assetStats[0] || {};
    const totalAssets = assets.total?.[0]?.count || 0;
    const assetsInService = assets.inService?.[0]?.count || 0;
    const assetsNearReplacement = assets.nearReplacement?.[0]?.count || 0;
    const assetsByCategory = assets.byCategory || [];

    const woStats = workOrderStats[0] || {};
    const activeWorkOrders = woStats.active?.[0]?.count || 0;
    const overdueWorkOrders = woStats.overdue?.[0]?.count || 0;
    const workOrdersByStatus = woStats.byStatus || [];
    const workOrdersByPriority = woStats.byPriority || [];
    const monthlyWorkOrders = woStats.monthly || [];

    // Derived calculations
    const avgFCI = recentFCA.length > 0
      ? recentFCA.reduce((s, f) => s + (f.facilityConditionIndex || 0), 0) / recentFCA.length
      : 0;

    const avgCompliance = recentAudits.length > 0
      ? recentAudits.reduce((s, a) => s + (a.complianceScore || 0), 0) / recentAudits.length
      : 0;

    const totalBudgeted = budgetData.reduce((s, b) => s + (b.totalBudgeted || 0), 0);
    const totalActual = budgetData.reduce((s, b) => s + (b.totalActual || 0), 0);
    const budgetVariance = totalBudgeted - totalActual;

    const currentMonthWO = monthlyWorkOrders.find((m) => m._id === currentDate.getMonth() + 1);
    const monthlyMaintenanceCost = currentMonthWO ? currentMonthWO.totalCost : 0;

    const result = {
      summary: {
        totalAssets,
        assetsInService,
        assetsNearReplacement,
        activeWorkOrders,
        openIncidents,
        highRiskIssues: highRiskIssues[0]?.count || 0,
        totalSites,
        maintenanceDue,
        facilityConditionIndex: Math.round(avgFCI * 100) / 100,
        complianceScore: Math.round(avgCompliance),
        monthlyMaintenanceCost,
        budgetVariance,
        totalBudgeted,
        totalActual,
        overdueWorkOrders,
      },
      charts: {
        assetsByCategory,
        workOrdersByStatus,
        workOrdersByPriority,
        monthlyWorkOrders,
        incidentsByType,
      },
      recent: {
        fcaAssessments: recentFCA,
        hsseAudits: recentAudits,
        budgets: budgetData,
      },
    };

    // Update cache
    dashboardCache = { data: result, timestamp: Date.now() };
    res.setHeader("X-Cache", "MISS");

    return res.json(result);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
