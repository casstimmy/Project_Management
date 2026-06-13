/**
 * Centralized demo / seed dataset for the OPAL Facility Management System.
 *
 * This module is the single source of truth used by BOTH:
 *   - the seeding API ( /pages/api/seed/index.js ) to build the database, and
 *   - the admin seeding page ( /pages/admin/seed.js ) to preview the data in tables.
 *
 * Records are linked together using human-readable `code` fields (e.g. site "HQ",
 * building "HQ-A"). The API resolves these codes to real MongoDB ObjectIds while
 * inserting, so the data here stays readable and easy to edit.
 *
 * Monetary values are in Nigerian Naira (₦).
 */

const now = new Date();
const day = 24 * 60 * 60 * 1000;
const addDays = (n) => new Date(now.getTime() + n * day);
const yearsAgo = (n) => new Date(now.getFullYear() - n, now.getMonth(), now.getDate());

export const SEED_DEFAULT_PASSWORD = "Password123!";

/* ───────────────────────────── USERS / TEAM ───────────────────────────── */
export const SEED_USERS = [
  { code: "U-FM", name: "Adaeze Okonkwo", email: "fm.demo@opal.test", role: "facility-manager", department: "Facilities", phone: "+234 803 100 0001" },
  { code: "U-TECH1", name: "Emeka Nwosu", email: "tech1.demo@opal.test", role: "technician", department: "Maintenance", phone: "+234 803 100 0002" },
  { code: "U-TECH2", name: "Bola Adeyemi", email: "tech2.demo@opal.test", role: "technician", department: "Maintenance", phone: "+234 803 100 0003" },
  { code: "U-AUD", name: "Chidinma Eze", email: "auditor.demo@opal.test", role: "auditor", department: "HSSE", phone: "+234 803 100 0004" },
  { code: "U-FIN", name: "Tunde Bakare", email: "finance.demo@opal.test", role: "finance-officer", department: "Finance", phone: "+234 803 100 0005" },
];

export const SEED_TEAM = [
  { code: "T-1", name: "Adaeze Okonkwo", email: "fm.demo@opal.test", role: "Facility Manager", type: "Specialist", phone: "+234 803 100 0001", notes: "Oversees all facility operations across sites." },
  { code: "T-2", name: "Emeka Nwosu", email: "tech1.demo@opal.test", role: "HVAC Technician", type: "Worker", phone: "+234 803 100 0002", notes: "Lead on mechanical and HVAC work orders." },
  { code: "T-3", name: "Bola Adeyemi", email: "tech2.demo@opal.test", role: "Electrical Technician", type: "Worker", phone: "+234 803 100 0003", notes: "Handles electrical and generator maintenance." },
  { code: "T-4", name: "Chidinma Eze", email: "auditor.demo@opal.test", role: "HSSE Auditor", type: "Specialist", phone: "+234 803 100 0004", notes: "Conducts safety audits and incident investigations." },
  { code: "T-5", name: "Tunde Bakare", email: "finance.demo@opal.test", role: "Finance Officer", type: "Specialist", phone: "+234 803 100 0005", notes: "Manages OPEX/CAPEX budgets and cost tracking." },
];

/* ───────────────────────────── SITES ───────────────────────────── */
export const SEED_SITES = [
  {
    code: "HQ", name: "OPAL Corporate Headquarters", siteCode: "STE-HQ",
    city: "Lagos", state: "Lagos", country: "Nigeria", street: "12 Adeola Odeku Street, Victoria Island",
    contactPerson: "Adaeze Okonkwo", contactPhone: "+234 803 100 0001", contactEmail: "fm.demo@opal.test",
    totalArea: 18500, status: "active",
    description: "Primary corporate headquarters housing executive offices, data centre and shared services.",
  },
  {
    code: "IKJ", name: "Ikeja Operations Centre", siteCode: "STE-IKJ",
    city: "Ikeja", state: "Lagos", country: "Nigeria", street: "5 Kudirat Abiola Way, Oregun",
    contactPerson: "Emeka Nwosu", contactPhone: "+234 803 100 0002", contactEmail: "tech1.demo@opal.test",
    totalArea: 9200, status: "active",
    description: "Operations and logistics centre with warehouse and workshop facilities.",
  },
  {
    code: "ABJ", name: "Abuja Regional Office", siteCode: "STE-ABJ",
    city: "Abuja", state: "FCT", country: "Nigeria", street: "Plot 244 Cadastral Zone, Central Business District",
    contactPerson: "Chidinma Eze", contactPhone: "+234 803 100 0004", contactEmail: "auditor.demo@opal.test",
    totalArea: 6400, status: "under-construction",
    description: "Regional office currently undergoing fit-out and expansion.",
  },
];

/* ───────────────────────────── BUILDINGS ───────────────────────────── */
export const SEED_BUILDINGS = [
  { code: "HQ-A", site: "HQ", name: "HQ Tower A", buildingCode: "BLD-HQA", type: "office", floors: 8, totalArea: 11000, yearBuilt: 2014, status: "operational", description: "Main office tower with executive suites and open-plan floors." },
  { code: "HQ-B", site: "HQ", name: "HQ Annex B", buildingCode: "BLD-HQB", type: "mixed-use", floors: 3, totalArea: 4200, yearBuilt: 2016, status: "operational", description: "Annex housing the data centre, cafeteria and conference facilities." },
  { code: "IKJ-W", site: "IKJ", name: "Ikeja Warehouse", buildingCode: "BLD-IKW", type: "warehouse", floors: 1, totalArea: 6000, yearBuilt: 2011, status: "operational", description: "High-bay warehouse for spares and equipment storage." },
  { code: "IKJ-S", site: "IKJ", name: "Ikeja Workshop", buildingCode: "BLD-IKS", type: "industrial", floors: 2, totalArea: 2400, yearBuilt: 2012, status: "under-maintenance", description: "Maintenance workshop and technician offices." },
  { code: "ABJ-1", site: "ABJ", name: "Abuja Office Block", buildingCode: "BLD-ABO", type: "office", floors: 4, totalArea: 6400, yearBuilt: 2023, status: "under-construction", description: "New regional office block under fit-out." },
];

/* ───────────────────────────── SPACES ───────────────────────────── */
export const SEED_SPACES = [
  { code: "SP-1", building: "HQ-A", name: "Executive Suite", spaceCode: "RM-801", floor: 8, type: "office", area: 220, capacity: 12, status: "in-use" },
  { code: "SP-2", building: "HQ-A", name: "Open Plan Floor 5", spaceCode: "RM-501", floor: 5, type: "office", area: 980, capacity: 120, status: "in-use" },
  { code: "SP-3", building: "HQ-A", name: "Main Reception", spaceCode: "RM-001", floor: 0, type: "lobby", area: 180, capacity: 40, status: "in-use" },
  { code: "SP-4", building: "HQ-B", name: "Primary Data Centre", spaceCode: "DC-101", floor: 1, type: "server-room", area: 140, capacity: 4, status: "in-use" },
  { code: "SP-5", building: "HQ-B", name: "Main Plant Room", spaceCode: "MP-B01", floor: 0, type: "mechanical", area: 95, capacity: 4, status: "in-use" },
  { code: "SP-6", building: "IKJ-W", name: "Warehouse Bay 1", spaceCode: "WB-001", floor: 0, type: "storage", area: 2800, capacity: 10, status: "in-use" },
  { code: "SP-7", building: "IKJ-S", name: "Electrical Workshop", spaceCode: "WS-201", floor: 2, type: "workshop", area: 320, capacity: 15, status: "under-maintenance" },
];

/* ───────────────────────────── ASSETS ───────────────────────────── */
export const SEED_ASSETS = [
  { code: "AS-CHILLER1", site: "HQ", building: "HQ-B", space: "SP-5", name: "Central Chiller Unit 1", category: "HVAC", manufacturer: "Carrier", model: "30XA-1002", serialNumber: "CRR-CH-0091", purchaseCost: 42000000, replacementCost: 52000000, usefulLife: 15, status: "in-service", condition: "Good", conditionRating: 4, maintenanceStrategy: "PPM", purchaseYearsAgo: 6 },
  { code: "AS-AHU5", site: "HQ", building: "HQ-A", space: "SP-2", name: "Air Handling Unit – Floor 5", category: "HVAC", manufacturer: "Daikin", model: "AHU-FCU-520", serialNumber: "DKN-AHU-5520", purchaseCost: 8500000, replacementCost: 10500000, usefulLife: 12, status: "in-service", condition: "Fair", conditionRating: 3, maintenanceStrategy: "PPM", purchaseYearsAgo: 7 },
  { code: "AS-GEN1", site: "HQ", building: "HQ-B", space: "SP-5", name: "Standby Generator 750kVA", category: "Generator", manufacturer: "Cummins", model: "C750D5", serialNumber: "CMN-GEN-7501", purchaseCost: 65000000, replacementCost: 78000000, usefulLife: 20, status: "in-service", condition: "Good", conditionRating: 4, maintenanceStrategy: "PPM", purchaseYearsAgo: 5 },
  { code: "AS-UPS1", site: "HQ", building: "HQ-B", space: "SP-4", name: "Data Centre UPS 120kVA", category: "Electrical", manufacturer: "Schneider", model: "Galaxy VS", serialNumber: "SCH-UPS-1201", purchaseCost: 18000000, replacementCost: 22000000, usefulLife: 10, status: "in-service", condition: "Good", conditionRating: 4, maintenanceStrategy: "PdM", purchaseYearsAgo: 3 },
  { code: "AS-LIFT1", site: "HQ", building: "HQ-A", space: "SP-3", name: "Passenger Lift – Core A", category: "Elevator", manufacturer: "KONE", model: "MonoSpace 500", serialNumber: "KNE-LFT-0501", purchaseCost: 30000000, replacementCost: 38000000, usefulLife: 20, status: "in-service", condition: "Fair", conditionRating: 3, maintenanceStrategy: "PPM", purchaseYearsAgo: 10 },
  { code: "AS-FIRE1", site: "HQ", building: "HQ-A", space: "SP-3", name: "Fire Alarm Control Panel", category: "Fire-Safety", manufacturer: "Honeywell", model: "NOTIFIER NFS2-3030", serialNumber: "HON-FAP-3030", purchaseCost: 6500000, replacementCost: 8000000, usefulLife: 12, status: "in-service", condition: "Good", conditionRating: 4, maintenanceStrategy: "PPM", purchaseYearsAgo: 4 },
  { code: "AS-PUMP1", site: "HQ", building: "HQ-B", space: "SP-5", name: "Domestic Water Booster Pump", category: "Plumbing", manufacturer: "Grundfos", model: "Hydro MPC-E", serialNumber: "GRF-PMP-0011", purchaseCost: 4200000, replacementCost: 5200000, usefulLife: 10, status: "out-of-service", condition: "Poor", conditionRating: 2, maintenanceStrategy: "RTF", purchaseYearsAgo: 8 },
  { code: "AS-CCTV1", site: "HQ", building: "HQ-A", space: "SP-3", name: "CCTV NVR & Camera System", category: "Security", manufacturer: "Hikvision", model: "DS-9664NI-I16", serialNumber: "HIK-NVR-9664", purchaseCost: 5500000, replacementCost: 7000000, usefulLife: 8, status: "in-service", condition: "Good", conditionRating: 4, maintenanceStrategy: "RTF", purchaseYearsAgo: 2 },
  { code: "AS-SWBD1", site: "IKJ", building: "IKJ-W", space: "SP-6", name: "Main Switchboard – Warehouse", category: "Electrical", manufacturer: "ABB", model: "MNS 3.0", serialNumber: "ABB-SWB-0301", purchaseCost: 12500000, replacementCost: 15000000, usefulLife: 18, status: "in-service", condition: "Good", conditionRating: 4, maintenanceStrategy: "PPM", purchaseYearsAgo: 9 },
  { code: "AS-FORK1", site: "IKJ", building: "IKJ-W", space: "SP-6", name: "Electric Forklift 2.5T", category: "Mechanical", manufacturer: "Toyota", model: "8FBE25", serialNumber: "TYT-FRK-2501", purchaseCost: 9800000, replacementCost: 12000000, usefulLife: 10, status: "in-service", condition: "Fair", conditionRating: 3, maintenanceStrategy: "PPM", purchaseYearsAgo: 4 },
];

/* ───────────────────────────── MAINTENANCE PLANS ───────────────────────────── */
export const SEED_MAINTENANCE = [
  { code: "MP-1", asset: "AS-CHILLER1", site: "HQ", building: "HQ-B", title: "Quarterly Chiller Servicing", maintenanceType: "PPM", frequency: "quarterly", priority: "high", status: "active", estimatedCost: 850000, actualCost: 780000, nextDueInDays: 21, assignedTo: "Emeka Nwosu", tasks: ["Inspect refrigerant pressures", "Clean condenser coils", "Check compressor oil", "Verify control sequences"] },
  { code: "MP-2", asset: "AS-GEN1", site: "HQ", building: "HQ-B", title: "Monthly Generator Load Test", maintenanceType: "PPM", frequency: "monthly", priority: "critical", status: "active", estimatedCost: 220000, actualCost: 200000, nextDueInDays: 6, assignedTo: "Bola Adeyemi", tasks: ["Run 30-min load test", "Check fuel and coolant levels", "Inspect battery", "Log running hours"] },
  { code: "MP-3", asset: "AS-LIFT1", site: "HQ", building: "HQ-A", title: "Monthly Lift Inspection", maintenanceType: "PPM", frequency: "monthly", priority: "high", status: "active", estimatedCost: 180000, actualCost: 0, nextDueInDays: -3, assignedTo: "Emeka Nwosu", tasks: ["Test emergency stop", "Inspect cables and pulleys", "Check door sensors", "Lubricate guide rails"] },
  { code: "MP-4", asset: "AS-UPS1", site: "HQ", building: "HQ-B", title: "UPS Battery Health Monitoring", maintenanceType: "PdM", frequency: "monthly", priority: "high", status: "active", estimatedCost: 120000, actualCost: 110000, nextDueInDays: 12, assignedTo: "Bola Adeyemi", tasks: ["Read battery impedance", "Check temperature logs", "Verify alarms"] },
  { code: "MP-5", asset: "AS-FIRE1", site: "HQ", building: "HQ-A", title: "Annual Fire Alarm Certification", maintenanceType: "PPM", frequency: "annual", priority: "critical", status: "active", estimatedCost: 450000, actualCost: 0, nextDueInDays: 45, assignedTo: "Chidinma Eze", tasks: ["Test all detection zones", "Verify panel batteries", "Test sounders", "Issue compliance certificate"] },
  { code: "MP-6", asset: "AS-FORK1", site: "IKJ", building: "IKJ-W", title: "Forklift Quarterly Service", maintenanceType: "PPM", frequency: "quarterly", priority: "medium", status: "paused", estimatedCost: 150000, actualCost: 0, nextDueInDays: 60, assignedTo: "Bola Adeyemi", tasks: ["Check hydraulics", "Inspect forks and mast", "Battery service"] },
];

/* ───────────────────────────── WORK ORDERS ───────────────────────────── */
export const SEED_WORKORDERS = [
  { code: "WO-1", asset: "AS-PUMP1", site: "HQ", building: "HQ-B", title: "Water booster pump not priming", type: "corrective", priority: "high", status: "in-progress", requestedBy: "Reception Desk", assignedTo: "Emeka Nwosu", laborCost: 80000, materialCost: 140000, estimatedHours: 6, scheduledInDays: 1, description: "Pump fails to maintain pressure; suspected faulty pressure switch." },
  { code: "WO-2", asset: "AS-AHU5", site: "HQ", building: "HQ-A", title: "AHU Floor 5 making abnormal noise", type: "corrective", priority: "medium", status: "assigned", requestedBy: "Floor 5 Admin", assignedTo: "Emeka Nwosu", laborCost: 50000, materialCost: 30000, estimatedHours: 4, scheduledInDays: 2, description: "Bearing noise reported from supply fan; inspect and replace if needed." },
  { code: "WO-3", asset: "AS-GEN1", site: "HQ", building: "HQ-B", title: "Generator monthly load test", type: "preventive", priority: "medium", status: "completed", requestedBy: "Facilities", assignedTo: "Bola Adeyemi", laborCost: 60000, materialCost: 20000, estimatedHours: 2, actualHours: 2, scheduledInDays: -5, completedInDays: -5, description: "Routine load test completed; all parameters within range." },
  { code: "WO-4", asset: "AS-LIFT1", site: "HQ", building: "HQ-A", title: "Lift door sensor intermittent fault", type: "corrective", priority: "critical", status: "open", requestedBy: "Security", assignedTo: "", laborCost: 0, materialCost: 0, estimatedHours: 5, scheduledInDays: 0, description: "Door re-opens intermittently; safety concern, prioritise." },
  { code: "WO-5", asset: "AS-FORK1", site: "IKJ", building: "IKJ-W", title: "Forklift hydraulic leak", type: "corrective", priority: "high", status: "on-hold", requestedBy: "Warehouse Lead", assignedTo: "Bola Adeyemi", laborCost: 40000, materialCost: 90000, estimatedHours: 3, scheduledInDays: 4, description: "Hydraulic fluid leak at lift cylinder; awaiting seal kit." },
  { code: "WO-6", asset: "AS-CCTV1", site: "HQ", building: "HQ-A", title: "Reception camera offline", type: "reactive", priority: "low", status: "completed", requestedBy: "Security", assignedTo: "Bola Adeyemi", laborCost: 25000, materialCost: 15000, estimatedHours: 1, actualHours: 1, scheduledInDays: -2, completedInDays: -2, description: "PoE port reset, camera restored to service." },
];

/* ───────────────────────────── INCIDENTS ───────────────────────────── */
export const SEED_INCIDENTS = [
  { code: "IN-1", site: "HQ", building: "HQ-A", title: "Slip on wet lobby floor", type: "injury", severity: "moderate", status: "investigating", location: "Main Reception", reportedBy: "Front Desk", occurredInDays: -4, description: "Visitor slipped on freshly mopped floor; minor bruising, first aid given.", immediateAction: "Area cordoned and wet-floor signage deployed.", rootCause: "Cleaning carried out during peak footfall without signage.", correctiveAction: "Reschedule cleaning to off-peak hours.", preventiveAction: "Mandatory wet-floor signage policy issued." },
  { code: "IN-2", site: "HQ", building: "HQ-B", title: "Minor electrical flashover at DB-3", type: "near-miss", severity: "major", status: "resolved", location: "Plant Room", reportedBy: "Emeka Nwosu", occurredInDays: -12, description: "Flashover during breaker switching; no injuries.", immediateAction: "Isolated circuit and de-energised board.", rootCause: "Loose busbar connection causing arcing.", correctiveAction: "Re-torqued connections and thermographic survey done.", preventiveAction: "Added busbar checks to PPM schedule." },
  { code: "IN-3", site: "IKJ", building: "IKJ-W", title: "Forklift collision with racking", type: "property-damage", severity: "minor", status: "closed", location: "Warehouse Bay 1", reportedBy: "Warehouse Lead", occurredInDays: -20, description: "Forklift clipped racking leg; minor dent, no stock damage.", immediateAction: "Racking inspected and confirmed structurally sound.", rootCause: "Operator visibility obstructed by oversized load.", correctiveAction: "Load height limit reinforced.", preventiveAction: "Refresher operator training scheduled." },
  { code: "IN-4", site: "HQ", building: "HQ-B", title: "Smoke detector activation – cafeteria", type: "fire", severity: "minor", status: "closed", location: "Cafeteria", reportedBy: "Catering Staff", occurredInDays: -30, description: "Burnt toast triggered detector; no actual fire.", immediateAction: "Area ventilated, alarm reset.", rootCause: "Detector over-sensitivity near cooking area.", correctiveAction: "Relocated detector and added heat detector.", preventiveAction: "Reviewed detector placement in kitchen zones." },
];

/* ───────────────────────────── HSSE AUDITS ───────────────────────────── */
export const SEED_HSSE = [
  {
    code: "HS-1", site: "HQ", building: "HQ-A", title: "Q2 Comprehensive HSSE Audit – HQ Tower A", auditType: "comprehensive", auditor: "Chidinma Eze", status: "completed", auditedInDays: -7,
    checklist: [
      { category: "Fire Safety", question: "Are fire extinguishers serviced and accessible?", response: "yes" },
      { category: "Fire Safety", question: "Are emergency exits clear and signed?", response: "yes" },
      { category: "Electrical", question: "Are distribution boards labelled and locked?", response: "no", comments: "DB on floor 3 found unlocked." },
      { category: "PPE", question: "Is PPE available and in good condition?", response: "yes" },
      { category: "Housekeeping", question: "Are walkways free of obstructions?", response: "yes" },
      { category: "First Aid", question: "Are first aid kits stocked and in date?", response: "no", comments: "Floor 5 kit missing burn dressings." },
    ],
    risks: [
      { hazard: "Unlocked distribution board", location: "Floor 3", probability: 3, severity: 4, recommendation: "Fit lock and restrict access." },
      { hazard: "Incomplete first aid kit", location: "Floor 5", probability: 2, severity: 3, recommendation: "Restock immediately." },
    ],
  },
  {
    code: "HS-2", site: "IKJ", building: "IKJ-W", title: "Warehouse Fire Safety Audit", auditType: "fire-safety", auditor: "Chidinma Eze", status: "in-progress", auditedInDays: -2,
    checklist: [
      { category: "Fire Safety", question: "Are hydrants and hoses operational?", response: "yes" },
      { category: "Fire Safety", question: "Is the sprinkler system inspected this year?", response: "no", comments: "Inspection overdue by 2 months." },
      { category: "Housekeeping", question: "Is combustible waste managed?", response: "yes" },
    ],
    risks: [
      { hazard: "Overdue sprinkler inspection", location: "Warehouse Bay 1", probability: 3, severity: 5, recommendation: "Book certified inspection urgently." },
    ],
  },
];

/* ───────────────────────────── EMERGENCY PLANS ───────────────────────────── */
export const SEED_EMERGENCY = [
  {
    code: "EM-1", site: "HQ", title: "HQ Fire & Evacuation Plan", version: "2.1", status: "active",
    incidentResponsePlan: "On alarm activation, the floor warden confirms the alarm, initiates evacuation and reports to the assembly point marshal.",
    evacuationProcedure: "Use nearest fire-rated staircase. Do not use lifts. Proceed to Assembly Point A and await roll-call.",
    assemblyPoints: [{ name: "Assembly Point A", location: "Front car park, north end" }, { name: "Assembly Point B", location: "Rear garden, by gate 2" }],
    contacts: [
      { name: "Adaeze Okonkwo", role: "Incident Commander", organization: "OPAL", phone: "+234 803 100 0001", type: "internal" },
      { name: "Lagos State Fire Service", role: "Fire & Rescue", organization: "LSFS", phone: "112", type: "external" },
    ],
    drills: [{ drillType: "Fire Evacuation", inDays: -40, participants: 210, duration: 18, scenario: "Full building evacuation drill", observations: "Evacuation completed in 7m20s; stairwell C congested.", passed: true, conductedBy: "Chidinma Eze" }],
  },
  {
    code: "EM-2", site: "IKJ", title: "Warehouse Emergency Response Plan", version: "1.3", status: "under-review",
    incidentResponsePlan: "Spill or fire events trigger immediate isolation of power and notification of the site marshal.",
    evacuationProcedure: "Evacuate via roller-shutter exits to the muster point in the loading yard.",
    assemblyPoints: [{ name: "Muster Point", location: "Loading yard, west side" }],
    contacts: [{ name: "Emeka Nwosu", role: "Site Marshal", organization: "OPAL", phone: "+234 803 100 0002", type: "internal" }],
    drills: [],
  },
];

/* ───────────────────────────── FCA ASSESSMENTS ───────────────────────────── */
export const SEED_FCA = [
  {
    code: "FC-1", site: "HQ", building: "HQ-A", title: "HQ Tower A Condition Assessment", assessor: "Chidinma Eze", status: "completed", assessedInDays: -25,
    currentReplacementValue: 2400000000,
    systemRatings: [
      { system: "Roofing", conditionRating: 3, estimatedCost: 18000000, notes: "Membrane nearing end of life on north section." },
      { system: "HVAC", conditionRating: 4, estimatedCost: 6000000, notes: "Generally good; one AHU needs attention." },
      { system: "Electrical", conditionRating: 4, estimatedCost: 4000000, notes: "Compliant; minor labelling gaps." },
      { system: "Elevators", conditionRating: 3, estimatedCost: 12000000, notes: "Lift control modernisation recommended." },
    ],
    defects: [
      { system: "Roofing", location: "North roof", description: "Membrane blistering and ponding", conditionRating: 2, estimatedCost: 18000000, priority: "high", repairScope: "Replace membrane on north section." },
      { system: "Elevators", location: "Core A", description: "Outdated lift controller", conditionRating: 3, estimatedCost: 12000000, priority: "medium", repairScope: "Modernise controller and door operator." },
    ],
    recommendations: "Prioritise roofing membrane replacement within 12 months; budget lift modernisation in next CAPEX cycle.",
  },
  {
    code: "FC-2", site: "IKJ", building: "IKJ-W", title: "Warehouse Condition Assessment", assessor: "Chidinma Eze", status: "in-progress", assessedInDays: -10,
    currentReplacementValue: 720000000,
    systemRatings: [
      { system: "Structural", conditionRating: 4, estimatedCost: 0, notes: "Sound; no significant defects." },
      { system: "Fire-Safety", conditionRating: 2, estimatedCost: 9000000, notes: "Sprinkler inspection overdue." },
      { system: "Flooring", conditionRating: 3, estimatedCost: 3500000, notes: "Surface wear in high-traffic aisles." },
    ],
    defects: [
      { system: "Fire-Safety", location: "Warehouse Bay 1", description: "Overdue sprinkler certification", conditionRating: 2, estimatedCost: 9000000, priority: "critical", repairScope: "Engage certified inspector and remediate." },
    ],
    recommendations: "Resolve sprinkler certification immediately; schedule floor resurfacing.",
  },
];

/* ───────────────────────────── BUDGETS ───────────────────────────── */
export const SEED_BUDGETS = [
  {
    code: "BG-1", site: "HQ", title: "HQ OPEX Budget", budgetType: "OPEX", fiscalYear: now.getFullYear(), status: "approved", costCenter: "FAC-HQ-OPEX",
    lineItems: [
      { category: "Repairs & Maintenance", budgetedAmount: 45000000, actualAmount: 38500000 },
      { category: "Utilities", budgetedAmount: 60000000, actualAmount: 64200000 },
      { category: "Security", budgetedAmount: 28000000, actualAmount: 27000000 },
      { category: "Cleaning", budgetedAmount: 16000000, actualAmount: 15400000 },
      { category: "Diesel", budgetedAmount: 35000000, actualAmount: 41000000 },
    ],
  },
  {
    code: "BG-2", site: "HQ", title: "HQ CAPEX Budget", budgetType: "CAPEX", fiscalYear: now.getFullYear(), status: "submitted", costCenter: "FAC-HQ-CAPEX",
    lineItems: [
      { category: "Plant & Machinery", budgetedAmount: 80000000, actualAmount: 0 },
      { category: "Equipment", budgetedAmount: 25000000, actualAmount: 12000000 },
      { category: "Buildings", budgetedAmount: 40000000, actualAmount: 18000000 },
    ],
  },
  {
    code: "BG-3", site: "IKJ", title: "Ikeja OPEX Budget", budgetType: "OPEX", fiscalYear: now.getFullYear(), status: "approved", costCenter: "FAC-IKJ-OPEX",
    lineItems: [
      { category: "Repairs & Maintenance", budgetedAmount: 18000000, actualAmount: 16800000 },
      { category: "Utilities", budgetedAmount: 22000000, actualAmount: 23500000 },
      { category: "Waste", budgetedAmount: 6000000, actualAmount: 5400000 },
    ],
  },
];

/* ───────────────────────────── GOVERNANCE ───────────────────────────── */
export const SEED_GOVERNANCE = [
  { code: "GV-1", site: "HQ", title: "Integrated FM Services Contract", type: "contract", status: "active", reference: "CTR-2024-014", value: 320000000, startYearsAgo: 1, endInDays: 300, parties: [{ name: "OPAL Facilities", role: "Client" }, { name: "PrimeCare FM Ltd", role: "Service Provider" }], description: "Bundled hard and soft FM services across HQ and Ikeja." },
  { code: "GV-2", site: "HQ", title: "Lift Maintenance SLA", type: "sla", status: "active", reference: "SLA-2025-003", value: 9600000, startYearsAgo: 0, endInDays: 180, serviceLevel: "99.5% lift availability", responseTime: "4 hours for entrapments", penalties: "5% monthly fee credit per breach.", parties: [{ name: "KONE Nigeria", role: "Service Provider" }], description: "Service level agreement for passenger lift maintenance and emergency response." },
  { code: "GV-3", site: "IKJ", title: "Fire Safety Compliance Code", type: "governing-code", status: "active", reference: "CODE-FS-01", value: 0, parties: [{ name: "Lagos State Fire Service", role: "Regulator" }], description: "Governing fire-safety standards and inspection cadence for warehouse operations." },
  { code: "GV-4", site: "HQ", title: "Diesel Supply Agreement", type: "contract", status: "under-review", reference: "CTR-2025-021", value: 48000000, startYearsAgo: 0, endInDays: 90, parties: [{ name: "OPAL Facilities", role: "Client" }, { name: "FuelMax Energy", role: "Supplier" }], description: "Bulk diesel supply for standby generators; under renewal review." },
];

/* ───────────────────────────── MEP / DESIGN DRAWINGS ───────────────────────────── */
export const SEED_DRAWINGS = [
  { code: "DR-1", title: "HQ Tower A – Architectural Floor Plans", category: "architectural", description: "Combined architectural layout for all floors of HQ Tower A.", fileName: "HQ-A-Architectural.pdf" },
  { code: "DR-2", title: "HQ Annex B – HVAC Schematic", category: "mechanical", description: "Chilled water and AHU distribution schematic for the data centre annex.", fileName: "HQ-B-HVAC.pdf" },
  { code: "DR-3", title: "HQ Tower A – Electrical Single Line Diagram", category: "electrical", description: "Power distribution single line diagram including standby generator and UPS.", fileName: "HQ-A-Electrical-SLD.pdf" },
  { code: "DR-4", title: "HQ Annex B – Plumbing Riser Diagram", category: "plumbing", description: "Domestic water and drainage riser layout for the annex building.", fileName: "HQ-B-Plumbing.pdf" },
  { code: "DR-5", title: "Ikeja Warehouse – Structural Layout", category: "structural", description: "Structural framing and foundation layout for the warehouse.", fileName: "IKW-Structural.pdf" },
  { code: "DR-6", title: "HQ Tower A – ELV & Data Systems", category: "elv", description: "Extra-low-voltage layout covering data, CCTV and access control.", fileName: "HQ-A-ELV.pdf" },
];

/* ───────────────────────────────────────────────────────────────────────────
 * CATALOG — drives the admin preview tables (headers + narration per dataset)
 * ──────────────────────────────────────────────────────────────────────────── */
export const SEED_CATALOG = [
  {
    key: "team", label: "Team & Users", icon: "Users",
    narration: "People who operate the facility. Each becomes both a login account (User) and a directory entry (Team member). Default password for seeded logins is provided below.",
    rows: SEED_TEAM,
    columns: [
      { key: "name", header: "Full Name" },
      { key: "role", header: "Role" },
      { key: "type", header: "Type" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
    ],
  },
  {
    key: "sites", label: "Sites", icon: "Building2",
    narration: "Top-level physical locations. Everything else (buildings, assets, budgets) rolls up to a site.",
    rows: SEED_SITES,
    columns: [
      { key: "siteCode", header: "Site Code" },
      { key: "name", header: "Site Name" },
      { key: "city", header: "City" },
      { key: "state", header: "State" },
      { key: "totalArea", header: "Area (m²)", numeric: true },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "buildings", label: "Buildings", icon: "Building",
    narration: "Buildings belong to a site and contain spaces and assets.",
    rows: SEED_BUILDINGS,
    columns: [
      { key: "buildingCode", header: "Building Code" },
      { key: "name", header: "Building Name" },
      { key: "site", header: "Site" },
      { key: "type", header: "Type" },
      { key: "floors", header: "Floors", numeric: true },
      { key: "totalArea", header: "Area (m²)", numeric: true },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "spaces", label: "Spaces", icon: "Layers",
    narration: "Rooms and zones within a building (offices, plant rooms, data centres). Assets are located in spaces.",
    rows: SEED_SPACES,
    columns: [
      { key: "spaceCode", header: "Room/Code" },
      { key: "name", header: "Space Name" },
      { key: "building", header: "Building" },
      { key: "floor", header: "Floor", numeric: true },
      { key: "type", header: "Type" },
      { key: "area", header: "Area (m²)", numeric: true },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "assets", label: "Assets", icon: "Package",
    narration: "Equipment and systems being managed. Each asset carries purchase cost, useful life and a maintenance strategy (PPM / PdM / RTF).",
    rows: SEED_ASSETS,
    columns: [
      { key: "name", header: "Asset Name" },
      { key: "category", header: "Category" },
      { key: "manufacturer", header: "Manufacturer" },
      { key: "model", header: "Model" },
      { key: "purchaseCost", header: "Purchase Cost", currency: true },
      { key: "condition", header: "Condition" },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "maintenance", label: "Maintenance Plans", icon: "CalendarClock",
    narration: "Scheduled preventive/predictive maintenance tied to assets, including frequency, due dates and cost estimates.",
    rows: SEED_MAINTENANCE,
    columns: [
      { key: "title", header: "Plan Title" },
      { key: "asset", header: "Asset" },
      { key: "maintenanceType", header: "Type" },
      { key: "frequency", header: "Frequency" },
      { key: "priority", header: "Priority" },
      { key: "estimatedCost", header: "Est. Cost", currency: true },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "workorders", label: "Work Orders", icon: "Wrench",
    narration: "Reactive and planned jobs raised against assets, with labour/material costs and assignment.",
    rows: SEED_WORKORDERS,
    columns: [
      { key: "title", header: "Work Order" },
      { key: "asset", header: "Asset" },
      { key: "type", header: "Type" },
      { key: "priority", header: "Priority" },
      { key: "assignedTo", header: "Assigned To" },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "incidents", label: "Incidents", icon: "AlertOctagon",
    narration: "Safety, security and property incidents with investigation status and corrective actions.",
    rows: SEED_INCIDENTS,
    columns: [
      { key: "title", header: "Incident" },
      { key: "type", header: "Type" },
      { key: "severity", header: "Severity" },
      { key: "site", header: "Site" },
      { key: "reportedBy", header: "Reported By" },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "hsse", label: "HSSE Audits", icon: "ShieldCheck",
    narration: "Health, Safety, Security & Environment audits with checklists and risk registers. Compliance scores are computed on save.",
    rows: SEED_HSSE,
    columns: [
      { key: "title", header: "Audit Title" },
      { key: "auditType", header: "Audit Type" },
      { key: "auditor", header: "Auditor" },
      { key: "site", header: "Site" },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "emergency", label: "Emergency Plans", icon: "Siren",
    narration: "Emergency preparedness and response plans with assembly points, contacts and drill logs.",
    rows: SEED_EMERGENCY,
    columns: [
      { key: "title", header: "Plan" },
      { key: "version", header: "Version" },
      { key: "site", header: "Site" },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "fca", label: "Condition Assessments", icon: "ClipboardCheck",
    narration: "Facility Condition Assessments with system ratings, defects and Facility Condition Index (FCI) computed on save.",
    rows: SEED_FCA,
    columns: [
      { key: "title", header: "Assessment" },
      { key: "building", header: "Building" },
      { key: "assessor", header: "Assessor" },
      { key: "currentReplacementValue", header: "CRV", currency: true },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "budgets", label: "Budgets", icon: "DollarSign",
    narration: "OPEX and CAPEX budgets with line items. Budgeted vs actual totals and variance are computed on save.",
    rows: SEED_BUDGETS,
    columns: [
      { key: "title", header: "Budget" },
      { key: "budgetType", header: "Type" },
      { key: "fiscalYear", header: "FY", numeric: true },
      { key: "site", header: "Site" },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "governance", label: "Contracts & Governance", icon: "FileText",
    narration: "Contracts, SLAs and governing codes with parties, values and renewal dates.",
    rows: SEED_GOVERNANCE,
    columns: [
      { key: "title", header: "Document" },
      { key: "type", header: "Type" },
      { key: "reference", header: "Reference" },
      { key: "value", header: "Value", currency: true },
      { key: "status", header: "Status" },
    ],
  },
  {
    key: "drawings", label: "MEP & Design Drawings", icon: "Map",
    narration: "Architectural, MEP, structural, interior and ELV drawings used as maintenance planning references.",
    rows: SEED_DRAWINGS,
    columns: [
      { key: "title", header: "Drawing" },
      { key: "category", header: "Category" },
      { key: "fileName", header: "File" },
    ],
  },
];

// Helpers exported for the API builder
export const SEED_HELPERS = { addDays, yearsAgo };
