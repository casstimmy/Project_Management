import { mongooseConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";
import WorkOrder from "@/models/WorkOrder";
import Incident from "@/models/Incident";
import HSSEAudit from "@/models/HSSEAudit";
import FCAAssessment from "@/models/FCAAssessment";
import MaintenancePlan from "@/models/MaintenancePlan";
import Budget from "@/models/Budget";
import Site from "@/models/Site";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const now = new Date();
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalAssets,
      assetsInService,
      assetsNearReplacement,
      activeWorkOrders,
      openIncidents,
      highRiskIssues,
      totalSites,
      recentFCA,
      recentAudits,
      maintenanceDue,
      budgetData,
      assetsByCategory,
      workOrdersByStatus,
      workOrdersByPriority,
      monthlyWorkOrders,
      incidentsByType,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: "in-service" }),
      Asset.countDocuments({
        replacementDueDate: { $lte: sixMonths, $gte: now },
      }),
      WorkOrder.countDocuments({
        status: { $in: ["open", "assigned", "in-progress"] },
      }),
      Incident.countDocuments({
        status: { $in: ["reported", "investigating"] },
      }),
      HSSEAudit.aggregate([
        { $unwind: "$risks" },
        { $match: { "risks.riskLevel": { $in: ["High", "Extreme"] }, "risks.status": { $ne: "completed" } } },
        { $count: "count" },
      ]),
      Site.countDocuments(),
      FCAAssessment.find().sort({ assessmentDate: -1 }).limit(5).select("title facilityConditionIndex building assessmentDate status").populate("building", "name"),
      HSSEAudit.find().sort({ auditDate: -1 }).limit(5).select("title complianceScore building auditDate status").populate("building", "name"),
      MaintenancePlan.countDocuments({
        nextDueDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: "active",
      }),
      Budget.find({ fiscalYear: now.getFullYear() }).select("budgetType totalBudgeted totalActual totalVariance title"),
      Asset.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      WorkOrder.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      WorkOrder.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      WorkOrder.aggregate([
        {
          $match: { createdAt: { $gte: startOfYear } },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
            totalCost: { $sum: "$totalCost" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Incident.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Calculate average FCI
    const avgFCI = recentFCA.length > 0
      ? recentFCA.reduce((s, f) => s + (f.facilityConditionIndex || 0), 0) / recentFCA.length
      : 0;

    // Calculate average compliance
    const avgCompliance = recentAudits.length > 0
      ? recentAudits.reduce((s, a) => s + (a.complianceScore || 0), 0) / recentAudits.length
      : 0;

    // Budget summary
    const totalBudgeted = budgetData.reduce((s, b) => s + (b.totalBudgeted || 0), 0);
    const totalActual = budgetData.reduce((s, b) => s + (b.totalActual || 0), 0);
    const budgetVariance = totalBudgeted - totalActual;

    // Monthly maintenance cost
    const currentMonthWO = monthlyWorkOrders.find((m) => m._id === now.getMonth() + 1);
    const monthlyMaintenanceCost = currentMonthWO ? currentMonthWO.totalCost : 0;

    return res.json({
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
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
