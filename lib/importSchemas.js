/**
 * Import schemas for the client data onboarding tool ( /pages/admin/import.js ).
 *
 * Each entity describes the exact columns an administrator can import from a
 * spreadsheet (CSV) or by pasting tabular data copied from Excel / another
 * system. Column metadata (header, requirement, type, allowed values and a
 * plain-English description) drives BOTH:
 *   - the "Data Dictionary" reference tables shown on the page, and
 *   - the downloadable CSV templates.
 *
 * This file is plain data only (no model imports) so it can be used on the
 * client. The matching server-side insert logic lives in /pages/api/admin/import.js.
 */

export const IMPORT_ENTITIES = [
  {
    key: "sites",
    label: "Sites",
    order: 1,
    narration:
      "Top-level physical locations for the client. Import these first — buildings, spaces and assets all reference a site by its Site Code.",
    columns: [
      { key: "name", header: "Site Name", required: true, type: "text", description: "Full name of the site.", example: "Lagos Corporate HQ" },
      { key: "code", header: "Site Code", required: true, type: "text", description: "Unique short code used to link buildings and assets to this site.", example: "STE-HQ" },
      { key: "street", header: "Street", required: false, type: "text", description: "Street / building address line.", example: "12 Adeola Odeku Street" },
      { key: "city", header: "City", required: false, type: "text", description: "City the site is located in.", example: "Lagos" },
      { key: "state", header: "State", required: false, type: "text", description: "State / province.", example: "Lagos" },
      { key: "country", header: "Country", required: false, type: "text", description: "Country.", example: "Nigeria" },
      { key: "contactPerson", header: "Contact Person", required: false, type: "text", description: "Primary on-site contact.", example: "Adaeze Okonkwo" },
      { key: "contactPhone", header: "Contact Phone", required: false, type: "text", description: "Contact phone number.", example: "+234 803 100 0001" },
      { key: "contactEmail", header: "Contact Email", required: false, type: "email", description: "Contact email address.", example: "hq@client.com" },
      { key: "totalArea", header: "Total Area (m²)", required: false, type: "number", description: "Gross floor area in square metres.", example: "18500" },
      { key: "status", header: "Status", required: false, type: "enum", options: ["active", "inactive", "under-construction", "decommissioned"], description: "Operational status. Defaults to 'active'.", example: "active" },
      { key: "description", header: "Description", required: false, type: "text", description: "Free-text notes about the site.", example: "Primary corporate headquarters." },
    ],
  },
  {
    key: "buildings",
    label: "Buildings",
    order: 2,
    narration:
      "Buildings belong to a site. Provide the parent Site Code (must already exist in the system) so each building is linked correctly.",
    columns: [
      { key: "siteCode", header: "Site Code", required: true, type: "ref", description: "Code of the parent site (must match an existing Site Code).", example: "STE-HQ" },
      { key: "name", header: "Building Name", required: true, type: "text", description: "Name of the building.", example: "HQ Tower A" },
      { key: "code", header: "Building Code", required: false, type: "text", description: "Short code used to link spaces and assets to this building.", example: "BLD-HQA" },
      { key: "type", header: "Type", required: false, type: "enum", options: ["office", "warehouse", "residential", "commercial", "industrial", "mixed-use", "other"], description: "Building category. Defaults to 'office'.", example: "office" },
      { key: "floors", header: "Floors", required: false, type: "number", description: "Number of floors.", example: "8" },
      { key: "totalArea", header: "Total Area (m²)", required: false, type: "number", description: "Gross floor area in square metres.", example: "11000" },
      { key: "yearBuilt", header: "Year Built", required: false, type: "number", description: "Year of construction.", example: "2014" },
      { key: "status", header: "Status", required: false, type: "enum", options: ["operational", "under-maintenance", "under-construction", "decommissioned"], description: "Operational status. Defaults to 'operational'.", example: "operational" },
      { key: "description", header: "Description", required: false, type: "text", description: "Free-text notes about the building.", example: "Main office tower." },
    ],
  },
  {
    key: "spaces",
    label: "Spaces / Rooms",
    order: 3,
    narration:
      "Rooms and zones within a building (offices, plant rooms, data centres). Provide the parent Building Code (must already exist).",
    columns: [
      { key: "buildingCode", header: "Building Code", required: true, type: "ref", description: "Code of the parent building (must match an existing Building Code).", example: "BLD-HQA" },
      { key: "name", header: "Space Name", required: true, type: "text", description: "Name of the room or space.", example: "Primary Data Centre" },
      { key: "code", header: "Room / Space Code", required: false, type: "text", description: "Room number or code used to link assets here.", example: "DC-101" },
      { key: "floor", header: "Floor", required: false, type: "number", description: "Floor number (0 = ground).", example: "1" },
      { key: "type", header: "Type", required: false, type: "enum", options: ["office", "meeting-room", "server-room", "restroom", "kitchen", "lobby", "corridor", "storage", "parking", "mechanical", "electrical", "workshop", "laboratory", "common-area", "other"], description: "Space category. Defaults to 'office'.", example: "server-room" },
      { key: "area", header: "Area (m²)", required: false, type: "number", description: "Floor area in square metres.", example: "140" },
      { key: "capacity", header: "Capacity", required: false, type: "number", description: "Occupancy / capacity.", example: "4" },
      { key: "status", header: "Status", required: false, type: "enum", options: ["in-use", "vacant", "under-maintenance", "reserved"], description: "Space status. Defaults to 'in-use'.", example: "in-use" },
      { key: "description", header: "Description", required: false, type: "text", description: "Free-text notes.", example: "Houses primary servers." },
    ],
  },
  {
    key: "assets",
    label: "Assets / Equipment",
    order: 4,
    narration:
      "The equipment register. Link each asset to its location using Site Code, Building Code and/or Space Code (all optional but recommended). Asset tags are generated automatically.",
    columns: [
      { key: "name", header: "Asset Name", required: true, type: "text", description: "Name of the asset.", example: "Central Chiller Unit 1" },
      { key: "siteCode", header: "Site Code", required: false, type: "ref", description: "Code of the site where the asset is located.", example: "STE-HQ" },
      { key: "buildingCode", header: "Building Code", required: false, type: "ref", description: "Code of the building where the asset is located.", example: "BLD-HQA" },
      { key: "spaceCode", header: "Space Code", required: false, type: "ref", description: "Code of the room/space where the asset is located.", example: "DC-101" },
      { key: "category", header: "Category", required: false, type: "enum", options: ["HVAC", "Electrical", "Plumbing", "Fire-Safety", "Security", "IT-Network", "Elevator", "Generator", "Furniture", "Appliance", "Structural", "Mechanical", "Other"], description: "Asset category. Defaults to 'Other'.", example: "HVAC" },
      { key: "manufacturer", header: "Manufacturer", required: false, type: "text", description: "Manufacturer / OEM.", example: "Carrier" },
      { key: "model", header: "Model", required: false, type: "text", description: "Model number / name.", example: "30XA-1002" },
      { key: "serialNumber", header: "Serial Number", required: false, type: "text", description: "Manufacturer serial number.", example: "CRR-CH-0091" },
      { key: "purchaseDate", header: "Purchase Date", required: false, type: "date", description: "Date purchased (YYYY-MM-DD).", example: "2020-03-15" },
      { key: "purchaseCost", header: "Purchase Cost", required: false, type: "number", description: "Original purchase cost.", example: "42000000" },
      { key: "installationDate", header: "Installation Date", required: false, type: "date", description: "Date installed/commissioned (YYYY-MM-DD).", example: "2020-04-01" },
      { key: "usefulLife", header: "Useful Life (yrs)", required: false, type: "number", description: "Expected useful life in years (used for replacement & depreciation).", example: "15" },
      { key: "replacementCost", header: "Replacement Cost", required: false, type: "number", description: "Estimated cost to replace.", example: "52000000" },
      { key: "status", header: "Status", required: false, type: "enum", options: ["in-service", "out-of-service", "disposed", "pending-installation"], description: "Operational status. Defaults to 'in-service'.", example: "in-service" },
      { key: "condition", header: "Condition", required: false, type: "enum", options: ["Excellent", "Good", "Fair", "Poor", "Critical"], description: "Physical condition. Defaults to 'Good'.", example: "Good" },
      { key: "conditionRating", header: "Condition Rating (1-5)", required: false, type: "number", description: "Numeric condition rating from 1 (worst) to 5 (best).", example: "4" },
      { key: "maintenanceStrategy", header: "Maintenance Strategy", required: false, type: "enum", options: ["RTF", "PPM", "PdM"], description: "RTF = Run-to-Fail, PPM = Planned Preventive, PdM = Predictive. Defaults to 'RTF'.", example: "PPM" },
      { key: "notes", header: "Notes", required: false, type: "text", description: "Free-text notes.", example: "Serves the data centre cooling loop." },
    ],
  },
  {
    key: "team",
    label: "Team / People",
    order: 5,
    narration:
      "The client's facility team directory. These are reference records only (not login accounts).",
    columns: [
      { key: "name", header: "Full Name", required: true, type: "text", description: "Person's full name.", example: "Emeka Nwosu" },
      { key: "role", header: "Role", required: true, type: "text", description: "Job role / title.", example: "HVAC Technician" },
      { key: "type", header: "Type", required: false, type: "enum", options: ["Worker", "Specialist"], description: "Worker or Specialist. Defaults to 'Worker'.", example: "Worker" },
      { key: "email", header: "Email", required: false, type: "email", description: "Email address.", example: "emeka@client.com" },
      { key: "phone", header: "Phone", required: false, type: "text", description: "Phone number.", example: "+234 803 100 0002" },
      { key: "notes", header: "Notes", required: false, type: "text", description: "Free-text notes.", example: "Lead on mechanical work orders." },
    ],
  },
];

export function getImportEntity(key) {
  return IMPORT_ENTITIES.find((e) => e.key === key) || null;
}
