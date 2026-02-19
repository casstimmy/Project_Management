import { mongooseConnect } from "@/lib/mongoose";
import Building from "@/models/Building";
import Site from "@/models/Site";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, siteId, search, status } = req.query;

      if (id) {
        const building = await Building.findById(id).populate("site");
        if (!building) return res.status(404).json({ error: "Building not found" });
        return res.json(building);
      }

      const filter = {};
      if (siteId) filter.site = siteId;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ];
      }

      const buildings = await Building.find(filter).populate("site", "name code").sort({ createdAt: -1 });
      return res.json(buildings);
    }

    if (method === "POST") {
      const { siteId, name, code, type, floors, totalArea, yearBuilt, description, status } = req.body;
      if (!siteId || !name) return res.status(400).json({ error: "siteId and name are required" });

      const building = await Building.create({
        site: siteId, name, code, type, floors, totalArea, yearBuilt, description, status,
      });

      await Site.findByIdAndUpdate(siteId, { $push: { buildings: building._id } });
      return res.status(201).json(building);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Building ID is required" });

      const updated = await Building.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) return res.status(404).json({ error: "Building not found" });
      return res.json(updated);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Building ID is required" });

      const building = await Building.findByIdAndDelete(id);
      if (!building) return res.status(404).json({ error: "Building not found" });

      await Site.findByIdAndUpdate(building.site, { $pull: { buildings: building._id } });
      return res.json({ success: true, message: "Building deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Buildings API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
