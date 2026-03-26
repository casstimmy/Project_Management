export default async function handler(req, res) {
  return res.status(403).json({ error: "Self-service registration is disabled" });
}
