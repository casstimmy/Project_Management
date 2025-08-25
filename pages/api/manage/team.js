import { mongooseConnect } from "@/lib/mongoose";
import { Team } from "@/models/Team";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  try {

    if (method === "GET") {
      const { id, search } = req.query;

      if (id) {
        const member = await Team.findById(id);
        if (!member) {
          return res.status(404).json({ success: false, message: "Member not found" });
        }
        return res.json(member);
      }

      if (search) {
        const members = await Team.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
          ],
        }).limit(10);
        return res.json(members);
      }

      const members = await Team.find();
      return res.json(members);
    }

 
    if (method === "POST") {
      const { name, role, type, email, phone } = req.body;

      if (!name || !role) {
        return res.status(400).json({ success: false, message: "Name and role are required" });
      }

      const member = await Team.create({
        name,
        role,
        type,
        email,
        phone,
      });

      return res.status(201).json(member);
    }

    if (method === "PUT") {
      const { _id, ...data } = req.body;
      if (!_id) {
        return res.status(400).json({ success: false, message: "Member ID is required" });
      }

      const updated = await Team.findByIdAndUpdate(_id, data, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      return res.json(updated);
    }

 
    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, message: "Member ID is required" });
      }

      const deleted = await Team.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      return res.json({ success: true, message: "Deleted successfully" });
    }

  
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (error) {
    console.error("Team API error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
