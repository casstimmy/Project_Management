import { mongooseConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, siteId, buildingId, category, status, search, page = 1, limit = 50, nearReplacement } = req.query;

      if (id) {
        const asset = await Asset.findById(id)
          .populate("site", "name code")
          .populate("building", "name code")
          .populate("facilitySpace", "name code floor");
        if (!asset) return res.status(404).json({ error: "Asset not found" });
        return res.json(asset);
      }

      const filter = {};
      if (siteId) filter.site = siteId;
      if (buildingId) filter.building = buildingId;
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { assetTag: { $regex: search, $options: "i" } },
          { serialNumber: { $regex: search, $options: "i" } },
          { manufacturer: { $regex: search, $options: "i" } },
        ];
      }

      // Assets near replacement (within 6 months)
      if (nearReplacement === "true") {
        const sixMonths = new Date();
        sixMonths.setMonth(sixMonths.getMonth() + 6);
        filter.replacementDueDate = { $lte: sixMonths, $gte: new Date() };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [assets, total] = await Promise.all([
        Asset.find(filter)
          .populate("site", "name")
          .populate("building", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Asset.countDocuments(filter),
      ]);

      return res.json({ assets, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.name) return res.status(400).json({ error: "Asset name is required" });

      const asset = new Asset(data);
      await asset.save();
      return res.status(201).json(asset);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Asset ID is required" });

      const updated = await Asset.findByIdAndUpdate(_id, data, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: "Asset not found" });
      return res.json(updated);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Asset ID is required" });

      const deleted = await Asset.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Asset not found" });
      return res.json({ success: true, message: "Asset deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Assets API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
