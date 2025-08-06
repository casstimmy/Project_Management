import { mongooseConnect } from "@/lib/mongoose";
import Project from "@/models/Project";
import Space from "@/models/Space";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const projects = await Project.find().sort({ createdAt: -1 });
        return res.status(200).json(projects);
      } catch (err) {
        return res.status(500).json({ error: "Error fetching projects." });
      }

    case "POST":
      try {
        const { spaceId, title, ...rest } = req.body;

        if (!spaceId || !title) {
          return res.status(400).json({ error: "spaceId and title are required" });
        }

        const project = await Project.create({ space: spaceId, title, ...rest });

        await Space.findByIdAndUpdate(spaceId, {
          $push: { projects: project._id },
        });

        return res.status(201).json(project);
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Error creating project." });
      }

    default:
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
