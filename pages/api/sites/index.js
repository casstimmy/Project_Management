import { mongooseConnect } from "@/lib/mongoose";
import Site from "@/models/Site";
import { authorize } from "@/lib/auth";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, search, status } = req.query;

      if (id) {
        const site = await Site.findById(id).populate("buildings");
        if (!site) return res.status(404).json({ error: "Site not found" });
        return res.json(site);
      }

      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { "address.city": { $regex: search, $options: "i" } },
        ];
      }
      if (status) filter.status = status;

      const sites = await Site.find(filter).sort({ createdAt: -1 });
      return res.json(sites);
    }

    if (method === "POST") {
      const { name, code, address, coordinates, contactPerson, contactPhone, contactEmail, totalArea, description, status } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      const site = await Site.create({
        name, code, address, coordinates, contactPerson, contactPhone,
        contactEmail, totalArea, description, status,
      });
      return res.status(201).json(site);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Site ID is required" });

      const updated = await Site.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) return res.status(404).json({ error: "Site not found" });
      return res.json(updated);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Site ID is required" });

      const deleted = await Site.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Site not found" });
      return res.json({ success: true, message: "Site deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Sites API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
