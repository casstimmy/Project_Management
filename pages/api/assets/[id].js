import { mongooseConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";
import Site from "@/models/Site";
import Building from "@/models/Building";
import FacilitySpace from "@/models/FacilitySpace";
import { sendApiError } from "@/lib/apiErrors";

function normalizeAssetPayload(payload = {}) {
  const data = { ...payload };

  ["site", "building", "facilitySpace", "imageUrl", "qrCode", "description", "model", "serialNumber", "internalRefNumber", "manufacturer", "notes"].forEach((key) => {
    if (data[key] === "") data[key] = undefined;
  });

  ["purchaseDate", "installationDate", "warrantyDate", "replacementDueDate", "lastMaintenanceDate", "nextMaintenanceDate"].forEach((key) => {
    if (data[key] === "") data[key] = undefined;
  });

  ["purchaseCost", "usefulLife", "replacementCost", "conditionRating", "currentValue", "salvageValue"].forEach((key) => {
    if (data[key] === "") data[key] = undefined;
  });

  return data;
}

export default async function handler(req, res) {
  await mongooseConnect();
  const { id } = req.query;
  const { method } = req;

  try {
    if (method === "GET") {
      const asset = await Asset.findById(id)
        .populate("site", "name code")
        .populate("building", "name code")
        .populate("facilitySpace", "name code floor");
      if (!asset) return res.status(404).json({ error: "Asset not found" });
      return res.json(asset);
    }

    if (method === "PUT") {
      const updated = await Asset.findById(id);
      if (!updated) return res.status(404).json({ error: "Asset not found" });

      Object.assign(updated, normalizeAssetPayload(req.body));
      await updated.save(); // triggers pre-save hooks
      return res.json(updated);
    }

    if (method === "DELETE") {
      const deleted = await Asset.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Asset not found" });
      return res.json({ success: true, message: "Asset deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Asset API error:", error);
    return sendApiError(res, error, "Unable to save asset");
  }
}
