import { mongooseConnect } from "@/lib/mongoose";
import GovernanceDoc from "@/models/GovernanceDoc";
import Site from "@/models/Site";
import { sendApiError } from "@/lib/apiErrors";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  if (!(await authenticate(req, res))) return;

  await mongooseConnect();
  const { method } = req;

  try {
    if (method === "GET") {
      const { id, type, status, search } = req.query;

      if (id) {
        const doc = await GovernanceDoc.findById(id).populate("site", "name");
        if (!doc) return res.status(404).json({ error: "Document not found" });
        return res.json(doc);
      }

      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { reference: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const docs = await GovernanceDoc.find(filter)
        .populate("site", "name")
        .sort({ updatedAt: -1 });
      return res.json(docs);
    }

    if (method === "POST") {
      const data = req.body;
      if (!data.title || !data.type) {
        return res.status(400).json({ error: "Title and type are required" });
      }

      const doc = await GovernanceDoc.create(data);
      return res.status(201).json(doc);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) return res.status(400).json({ error: "Document ID is required" });

      const doc = await GovernanceDoc.findByIdAndUpdate(_id, data, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: "Document not found" });
      return res.json(doc);
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Document ID is required" });

      const deleted = await GovernanceDoc.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Document not found" });
      return res.json({ success: true, message: "Document deleted" });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Governance API error:", error);
    return sendApiError(res, error, "Unable to save governance document");
  }
}
