/**
 * Client data onboarding / import API.
 *
 *   POST /api/admin/import   body: { entity: "sites" | "buildings" | ... , rows: [ {...}, ... ] }
 *
 * Admin-only. Inserts client records row by row, using
 * Model.create() so schema pre-save hooks (asset tags, depreciation, etc.) run.
 * Returns a per-row result so the UI can report exactly which rows succeeded
 * and which failed and why.
 */
import { mongooseConnect } from "@/lib/mongoose";
import { authenticate } from "@/lib/auth";
import { getImportEntity } from "@/lib/importSchemas";

import Site from "@/models/Site";
import Building from "@/models/Building";
import FacilitySpace from "@/models/FacilitySpace";
import Asset from "@/models/Asset";
import { Team } from "@/models/Team";

const num = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
};
const date = (v) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const str = (v) => (v == null ? "" : String(v).trim());

function validateEnums(entityKey, row) {
  const entity = getImportEntity(entityKey);
  const errors = [];
  for (const col of entity.columns) {
    const raw = row[col.key];
    if (col.required && (raw == null || String(raw).trim() === "")) {
      errors.push(`Missing required "${col.header}"`);
    }
    if (col.type === "enum" && raw != null && String(raw).trim() !== "") {
      if (!col.options.includes(String(raw).trim())) {
        errors.push(`"${col.header}" must be one of: ${col.options.join(", ")}`);
      }
    }
  }
  return errors;
}

/* Builders: turn a validated row into a document and create it. */
const builders = {
  async sites(row, ctx) {
    return Site.create({
      name: str(row.name),
      code: str(row.code),
      address: { street: str(row.street), city: str(row.city), state: str(row.state), country: str(row.country) },
      contactPerson: str(row.contactPerson),
      contactPhone: str(row.contactPhone),
      contactEmail: str(row.contactEmail),
      totalArea: num(row.totalArea),
      status: str(row.status) || "active",
      description: str(row.description),
      createdBy: ctx.userId,
    });
  },

  async buildings(row, ctx) {
    const site = await Site.findOne({ code: str(row.siteCode) });
    if (!site) throw new Error(`No site found with code "${str(row.siteCode)}"`);
    const doc = await Building.create({
      site: site._id,
      name: str(row.name),
      code: str(row.code),
      type: str(row.type) || "office",
      floors: num(row.floors),
      totalArea: num(row.totalArea),
      yearBuilt: num(row.yearBuilt),
      status: str(row.status) || "operational",
      description: str(row.description),
      createdBy: ctx.userId,
    });
    await Site.findByIdAndUpdate(site._id, { $addToSet: { buildings: doc._id } });
    return doc;
  },

  async spaces(row, ctx) {
    const building = await Building.findOne({ code: str(row.buildingCode) });
    if (!building) throw new Error(`No building found with code "${str(row.buildingCode)}"`);
    const doc = await FacilitySpace.create({
      building: building._id,
      name: str(row.name),
      code: str(row.code),
      floor: num(row.floor),
      type: str(row.type) || "office",
      area: num(row.area),
      capacity: num(row.capacity),
      status: str(row.status) || "in-use",
      description: str(row.description),
      createdBy: ctx.userId,
    });
    await Building.findByIdAndUpdate(building._id, { $addToSet: { spaces: doc._id } });
    return doc;
  },

  async assets(row, ctx) {
    let site = null;
    let building = null;
    let space = null;
    if (str(row.siteCode)) site = await Site.findOne({ code: str(row.siteCode) });
    if (str(row.buildingCode)) {
      building = await Building.findOne({
        code: str(row.buildingCode),
        ...(site ? { site: site._id } : {}),
      });
    }
    if (str(row.spaceCode)) {
      space = await FacilitySpace.findOne({
        code: str(row.spaceCode),
        ...(building ? { building: building._id } : {}),
      });
    }
    const doc = await Asset.create({
      name: str(row.name),
      site: site?._id,
      building: building?._id,
      facilitySpace: space?._id,
      category: str(row.category) || "Other",
      manufacturer: str(row.manufacturer),
      model: str(row.model),
      serialNumber: str(row.serialNumber),
      purchaseDate: date(row.purchaseDate),
      purchaseCost: num(row.purchaseCost) || 0,
      installationDate: date(row.installationDate),
      usefulLife: num(row.usefulLife) || 0,
      replacementCost: num(row.replacementCost) || 0,
      status: str(row.status) || "in-service",
      condition: str(row.condition) || "Good",
      conditionRating: num(row.conditionRating) || 3,
      maintenanceStrategy: str(row.maintenanceStrategy) || "RTF",
      notes: str(row.notes),
      createdBy: ctx.userId,
    });
    if (space) await FacilitySpace.findByIdAndUpdate(space._id, { $addToSet: { assets: doc._id } });
    return doc;
  },

  async team(row) {
    return Team.create({
      name: str(row.name),
      role: str(row.role),
      type: str(row.type) || "Worker",
      email: str(row.email),
      phone: str(row.phone),
      notes: str(row.notes),
    });
  },
};

export default async function handler(req, res) {
  const user = await authenticate(req, res);
  if (!user) return;

  if (user.role !== "admin") {
    return res.status(403).json({ error: "Only administrators can import client data." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { entity, rows } = req.body || {};
  const entityDef = getImportEntity(entity);
  if (!entityDef || !builders[entity]) {
    return res.status(400).json({ error: "Unknown or unsupported import entity." });
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "No rows provided to import." });
  }
  if (rows.length > 2000) {
    return res.status(400).json({ error: "Too many rows in a single import (max 2000)." });
  }

  await mongooseConnect();
  const ctx = { userId: user.id || null };

  let created = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 1;
    const row = rows[i] || {};
    const validation = validateEnums(entity, row);
    if (validation.length > 0) {
      errors.push({ row: rowNumber, error: validation.join("; ") });
      continue;
    }
    try {
      await builders[entity](row, ctx);
      created++;
    } catch (err) {
      errors.push({ row: rowNumber, error: err.message || "Insert failed" });
    }
  }

  return res.status(created > 0 ? 201 : 400).json({
    entity,
    total: rows.length,
    created,
    failed: errors.length,
    errors,
  });
}
