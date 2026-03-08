import { mongooseConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Site from "@/models/Site";
import Building from "@/models/Building";
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
