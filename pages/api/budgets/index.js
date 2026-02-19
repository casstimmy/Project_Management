import { mongooseConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";

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
      const data = req.body;
      if (!data.title || !data.fiscalYear || !data.budgetType) {
        return res.status(400).json({ error: "Title, fiscal year, and budget type are required" });
      }

      const budget = new Budget(data);
      await budget.save();
      return res.status(201).json(budget);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Budget ID is required" });

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
    return res.status(500).json({ error: "Internal server error" });
  }
}
