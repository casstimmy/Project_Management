import { mongooseConnect } from "@/lib/mongoose";
import FacilitySpace from "@/models/FacilitySpace";
import Building from "@/models/Building";
import Asset from "@/models/Asset";
import { sendApiError } from "@/lib/apiErrors";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const filter = {};
    if (req.query.buildingId) filter.building = req.query.buildingId;

    const spaces = await FacilitySpace.find(filter)
      .populate("building", "name code")
      .sort({ floor: 1, name: 1 });

    return res.json(spaces);
  } catch (error) {
    console.error("Facility spaces API error:", error);
    return sendApiError(res, error, "Unable to load facility spaces");
  }
}
