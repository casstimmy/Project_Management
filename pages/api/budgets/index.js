import { mongooseConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Site from "@/models/Site";
import Building from "@/models/Building";
import Project from "@/models/Project";
import { sendApiError } from "@/lib/apiErrors";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, siteId, fiscalYear, budgetType, status, search } = req.query;

      if (id) {
        const budget = await Budget.findById(id)
          .populate("site", "name")
          .populate("building", "name");
        if (!budget) return res.status(404).json({ error: "Budget not found" });
        return res.json(budget);
      }

      const filter = {};
      if (siteId) filter.site = siteId;
      if (fiscalYear) filter.fiscalYear = parseInt(fiscalYear);
      if (budgetType) filter.budgetType = budgetType;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { costCenter: { $regex: search, $options: "i" } },
        ];
      }

      const budgets = await Budget.find(filter)
        .populate("site", "name")
        .sort({ fiscalYear: -1, budgetType: 1 });
      return res.json(budgets);
    }

    if (method === "POST") {
      const data = { ...req.body };
      if (!data.title || !data.fiscalYear || !data.budgetType) {
        return res.status(400).json({ error: "Title, fiscal year, and budget type are required" });
      }
      // Normalize empty ObjectId fields to prevent BSON cast errors
      if (!data.site) delete data.site;
      if (!data.building) delete data.building;

      const budget = new Budget(data);
      await budget.save();
      return res.status(201).json(budget);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Budget ID is required" });
      // Normalize empty ObjectId fields
      if (!data.site) data.site = undefined;
      if (!data.building) data.building = undefined;

      const budget = await Budget.findById(_id);
      if (!budget) return res.status(404).json({ error: "Budget not found" });

      Object.assign(budget, data);
      await budget.save();
      return res.json(budget);
    }

    if (method === "PATCH") {
      // Sync actuals from projects for a specific budget
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Budget ID is required" });

      const budget = await Budget.findById(id);
      if (!budget) return res.status(404).json({ error: "Budget not found" });

      // Find projects at the same site/building
      const projectFilter = {};
      if (budget.site) projectFilter.site = budget.site;

      const projects = await Project.find(projectFilter);

      // Aggregate project budget actuals by category
      const projectActuals = {};
      for (const proj of projects) {
        for (const item of (proj.budget || [])) {
          if (item.category) {
            projectActuals[item.category] = (projectActuals[item.category] || 0) + (item.actual || 0);
          }
        }
      }

      // Update matching line items
      let updated = false;
      for (const lineItem of budget.lineItems) {
        const matchedActual = projectActuals[lineItem.category];
        if (matchedActual !== undefined) {
          lineItem.actualAmount = matchedActual;
          updated = true;
        }
      }

      if (updated) {
        await budget.save();
      }

      return res.json({ success: true, budget, projectCount: projects.length });
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Budget ID is required" });

      const deleted = await Budget.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Budget not found" });
      return res.json({ success: true, message: "Budget deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Budgets API error:", error);
    return sendApiError(res, error, "Unable to save budget");
  }
}
