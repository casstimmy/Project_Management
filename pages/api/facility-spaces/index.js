import { mongooseConnect } from "@/lib/mongoose";
import FacilitySpace from "@/models/FacilitySpace";
import Building from "@/models/Building";
import Asset from "@/models/Asset";
import { sendApiError } from "@/lib/apiErrors";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, buildingId, search } = req.query;

      if (id) {
        const space = await FacilitySpace.findById(id).populate("building", "name code");
        if (!space) return res.status(404).json({ error: "Space not found" });
        return res.json(space);
      }

      const filter = {};
      if (buildingId) filter.building = buildingId;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const spaces = await FacilitySpace.find(filter)
        .populate("building", "name code")
        .sort({ floor: 1, name: 1 });
      return res.json(spaces);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.name || !data.building) {
        return res.status(400).json({ error: "Name and building are required" });
      }

      const space = await FacilitySpace.create(data);
      return res.status(201).json(space);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Space ID is required" });

      const space = await FacilitySpace.findByIdAndUpdate(_id, data, { new: true, runValidators: true });
      if (!space) return res.status(404).json({ error: "Space not found" });
      return res.json(space);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Space ID is required" });

      const deleted = await FacilitySpace.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Space not found" });
      return res.json({ success: true, message: "Space deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Facility spaces API error:", error);
    return sendApiError(res, error, "Unable to save facility space");
  }
}
