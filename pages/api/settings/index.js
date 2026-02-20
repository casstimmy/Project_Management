import { mongooseConnect } from "@/lib/mongoose";
import Settings from "@/models/Settings";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === "GET") {
    try {
      const settings = await Settings.find();
      const result = {};
      settings.forEach((s) => {
        result[s.key] = s.value;
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: "Key is required" });

      await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update setting" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
