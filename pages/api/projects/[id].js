// /pages/api/projects/[id].js
import { mongooseConnect } from "@/lib/mongoose";
import Project from "@/models/Project";

export default async function handler(req, res) {
  await mongooseConnect();

  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case "GET":
      try {
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ error: "Project not found." });
        }
        return res.status(200).json(project);
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Error fetching project." });
      }

    case "PUT":
      try {
        const updated = await Project.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updated) {
          return res.status(404).json({ error: "Project not found." });
        }
        return res.status(200).json(updated);
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Error updating project." });
      }

    case "DELETE":
      try {
        const deleted = await Project.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ error: "Project not found." });
        }
        return res.status(200).json({ message: "Project deleted." });
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Error deleting project." });
      }

    default:
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
