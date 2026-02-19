import { mongooseConnect } from "@/lib/mongoose";
import Site from "@/models/Site";

export default async function handler(req, res) {
  await mongooseConnect();
  const { id } = req.query;
  const { method } = req;

  try {
    if (method === "GET") {
      const site = await Site.findById(id).populate("buildings");
      if (!site) return res.status(404).json({ error: "Site not found" });
      return res.json(site);
    }

    if (method === "PUT") {
      const updated = await Site.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: "Site not found" });
      return res.json(updated);
    }

    if (method === "DELETE") {
      const deleted = await Site.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Site not found" });
      return res.json({ success: true, message: "Site deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Site API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
