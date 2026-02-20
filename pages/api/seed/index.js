// pages/api/seed/index.js
import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import Site from "@/models/Site";
import Building from "@/models/Building";
import FacilitySpace from "@/models/FacilitySpace";
import Asset from "@/models/Asset";
import Budget from "@/models/Budget";
import WorkOrder from "@/models/WorkOrder";
import MaintenancePlan from "@/models/MaintenancePlan";
import Incident from "@/models/Incident";
import FCAAssessment from "@/models/FCAAssessment";
import HSSEAudit from "@/models/HSSEAudit";
import EmergencyPlan from "@/models/EmergencyPlan";
import Equipment from "@/models/Equipment";
import { Team } from "@/models/Team";
import Space from "@/models/Space";
import Project from "@/models/Project";
import Task from "@/models/Task";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await mongooseConnect();

  try {
    // ─── 0. Clear existing seed data for a clean re-seed ───
    await Promise.all([
      Site.deleteMany({}),
      Building.deleteMany({}),
      FacilitySpace.deleteMany({}),
      Asset.deleteMany({}),
      Equipment.deleteMany({}),
      Team.deleteMany({}),
      Budget.deleteMany({}),
      WorkOrder.deleteMany({}),
      MaintenancePlan.deleteMany({}),
      Incident.deleteMany({}),
      FCAAssessment.deleteMany({}),
      HSSEAudit.deleteMany({}),
      EmergencyPlan.deleteMany({}),
      Space.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
    ]);

    // Drop stale unique indexes that may conflict
    const db = mongoose.connection.db;
    const dropIndex = async (col, idx) => {
      try { await db.collection(col).dropIndex(idx); } catch {}
    };
    await Promise.all([
      dropIndex("assets", "assetTag_1"),
      dropIndex("workorders", "workOrderNumber_1"),
      dropIndex("sites", "code_1"),
    ]);

    // ─── 1. Sites ───
    const sites = await Site.insertMany([
      {
        name: "Eko Atlantic Complex",
        code: "EKO-001",
        address: { street: "Eko Atlantic Avenue", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "101001" },
        coordinates: { latitude: 6.4281, longitude: 3.4219 },
        contactPerson: "Adebayo Ogundimu",
        contactPhone: "+234 801 234 5678",
        contactEmail: "adebayo@ekoatlantic.ng",
        totalArea: 50000,
        status: "active",
        description: "Main corporate facility and administration center in Victoria Island",
      },
      {
        name: "Lekki Industrial Park",
        code: "LEK-002",
        address: { street: "12 Lekki-Epe Expressway", city: "Lagos", state: "Lagos", country: "Nigeria", postalCode: "106104" },
        coordinates: { latitude: 6.4698, longitude: 3.6013 },
        contactPerson: "Chinwe Okafor",
        contactPhone: "+234 802 345 6789",
        contactEmail: "chinwe@lekkipark.ng",
        totalArea: 120000,
        status: "active",
        description: "Industrial and warehousing facility for equipment storage and manufacturing",
      },
      {
        name: "Abuja Federal Facility",
        code: "ABJ-003",
        address: { street: "Plot 45, Cadastral Zone", city: "Abuja", state: "FCT", country: "Nigeria", postalCode: "900001" },
        coordinates: { latitude: 9.0579, longitude: 7.4951 },
        contactPerson: "Musa Ibrahim",
        contactPhone: "+234 803 456 7890",
        contactEmail: "musa@abujafacility.ng",
        totalArea: 35000,
        status: "active",
        description: "Federal government liaison and northern region operations center",
      },
    ]);

    // ─── 2. Buildings ───
    const buildings = await Building.insertMany([
      { site: sites[0]._id, name: "Admin Tower", code: "BLD-A1", type: "office", floors: 12, totalArea: 18000, yearBuilt: 2018, status: "operational", description: "Main administrative headquarters" },
      { site: sites[0]._id, name: "Tech Hub", code: "BLD-A2", type: "office", floors: 5, totalArea: 8000, yearBuilt: 2020, status: "operational", description: "IT and technology operations center" },
      { site: sites[1]._id, name: "Warehouse A", code: "BLD-B1", type: "warehouse", floors: 2, totalArea: 25000, yearBuilt: 2015, status: "operational", description: "Primary material and equipment warehouse" },
      { site: sites[1]._id, name: "Workshop Block", code: "BLD-B2", type: "industrial", floors: 3, totalArea: 12000, yearBuilt: 2016, status: "operational", description: "Maintenance and fabrication workshop" },
      { site: sites[2]._id, name: "Federal Office Building", code: "BLD-C1", type: "office", floors: 8, totalArea: 14000, yearBuilt: 2010, status: "operational", description: "Government liaison office block" },
      { site: sites[2]._id, name: "Conference Center", code: "BLD-C2", type: "commercial", floors: 3, totalArea: 6000, yearBuilt: 2012, status: "under-maintenance", description: "Multi-purpose conference and events center" },
    ]);

    // Link buildings to sites
    await Site.findByIdAndUpdate(sites[0]._id, { $push: { buildings: { $each: [buildings[0]._id, buildings[1]._id] } } });
    await Site.findByIdAndUpdate(sites[1]._id, { $push: { buildings: { $each: [buildings[2]._id, buildings[3]._id] } } });
    await Site.findByIdAndUpdate(sites[2]._id, { $push: { buildings: { $each: [buildings[4]._id, buildings[5]._id] } } });

    // ─── 3. Facility Spaces ───
    const facilitySpaces = await FacilitySpace.insertMany([
      { building: buildings[0]._id, name: "Executive Suite 12th Floor", code: "FS-A1-12", floor: 12, type: "office", area: 400, capacity: 20, status: "in-use" },
      { building: buildings[0]._id, name: "Main Server Room", code: "FS-A1-B1", floor: 0, type: "server-room", area: 200, capacity: 0, status: "in-use" },
      { building: buildings[0]._id, name: "Board Room", code: "FS-A1-10", floor: 10, type: "meeting-room", area: 150, capacity: 50, status: "in-use" },
      { building: buildings[1]._id, name: "Open Plan Office", code: "FS-A2-02", floor: 2, type: "office", area: 800, capacity: 100, status: "in-use" },
      { building: buildings[1]._id, name: "Innovation Lab", code: "FS-A2-04", floor: 4, type: "laboratory", area: 250, capacity: 30, status: "in-use" },
      { building: buildings[2]._id, name: "Main Storage Area", code: "FS-B1-01", floor: 1, type: "storage", area: 12000, capacity: 0, status: "in-use" },
      { building: buildings[3]._id, name: "Mechanical Workshop", code: "FS-B2-01", floor: 1, type: "workshop", area: 3000, capacity: 40, status: "in-use" },
      { building: buildings[4]._id, name: "Government Liaison Office", code: "FS-C1-05", floor: 5, type: "office", area: 500, capacity: 30, status: "in-use" },
      { building: buildings[5]._id, name: "Main Conference Hall", code: "FS-C2-01", floor: 1, type: "common-area", area: 2000, capacity: 500, status: "under-maintenance" },
    ]);

    // Link spaces to buildings
    await Building.findByIdAndUpdate(buildings[0]._id, { $push: { spaces: { $each: [facilitySpaces[0]._id, facilitySpaces[1]._id, facilitySpaces[2]._id] } } });
    await Building.findByIdAndUpdate(buildings[1]._id, { $push: { spaces: { $each: [facilitySpaces[3]._id, facilitySpaces[4]._id] } } });
    await Building.findByIdAndUpdate(buildings[2]._id, { $push: { spaces: [facilitySpaces[5]._id] } });
    await Building.findByIdAndUpdate(buildings[3]._id, { $push: { spaces: [facilitySpaces[6]._id] } });
    await Building.findByIdAndUpdate(buildings[4]._id, { $push: { spaces: [facilitySpaces[7]._id] } });
    await Building.findByIdAndUpdate(buildings[5]._id, { $push: { spaces: [facilitySpaces[8]._id] } });

    // ─── 4. Assets ───
    const assets = await Asset.insertMany([
      {
        site: sites[0]._id, building: buildings[0]._id, facilitySpace: facilitySpaces[1]._id,
        name: "Dell PowerEdge R750xs Server", category: "IT-Network",
        description: "Primary data center server rack", model: "R750xs",
        manufacturer: "Dell Technologies", serialNumber: "SRV-2024-001",
        purchaseDate: new Date("2023-06-15"), purchaseCost: 8500000,
        status: "in-service", condition: "Excellent", conditionRating: 5,
        maintenanceStrategy: "PPM", usefulLife: 7, replacementCost: 9200000,
      },
      {
        site: sites[0]._id, building: buildings[0]._id, facilitySpace: facilitySpaces[0]._id,
        name: "Daikin VRV IV Central AC", category: "HVAC",
        description: "Central air conditioning system for admin tower", model: "RXYQ48TATF",
        manufacturer: "Daikin", serialNumber: "DAK-HVAC-2020-012",
        purchaseDate: new Date("2020-03-10"), purchaseCost: 15000000,
        status: "in-service", condition: "Good", conditionRating: 4,
        maintenanceStrategy: "PPM", usefulLife: 15, replacementCost: 18000000,
      },
      {
        site: sites[1]._id, building: buildings[2]._id, facilitySpace: facilitySpaces[5]._id,
        name: "Caterpillar 500kVA Generator", category: "Generator",
        description: "Backup power generator for warehouse complex", model: "C15",
        manufacturer: "Caterpillar", serialNumber: "CAT-GEN-2019-007",
        purchaseDate: new Date("2019-01-20"), purchaseCost: 45000000,
        status: "in-service", condition: "Good", conditionRating: 4,
        maintenanceStrategy: "PPM", usefulLife: 20, replacementCost: 52000000,
      },
      {
        site: sites[0]._id, building: buildings[0]._id,
        name: "Otis Gen2 Elevator", category: "Elevator",
        description: "Passenger elevator servicing floors 1–12", model: "Gen2 Premier",
        manufacturer: "Otis Elevator", serialNumber: "OTIS-ELV-2018-003",
        purchaseDate: new Date("2018-08-01"), purchaseCost: 25000000,
        status: "in-service", condition: "Good", conditionRating: 4,
        maintenanceStrategy: "PPM", usefulLife: 25, replacementCost: 30000000,
      },
      {
        site: sites[1]._id, building: buildings[3]._id, facilitySpace: facilitySpaces[6]._id,
        name: "Fire Alarm Control Panel", category: "Fire-Safety",
        description: "Addressable fire alarm system for workshop block", model: "Simplex 4100ES",
        manufacturer: "Johnson Controls", serialNumber: "FA-2021-015",
        purchaseDate: new Date("2021-04-12"), purchaseCost: 3500000,
        status: "in-service", condition: "Excellent", conditionRating: 5,
        maintenanceStrategy: "PPM", usefulLife: 10, replacementCost: 4200000,
      },
      {
        site: sites[2]._id, building: buildings[4]._id, facilitySpace: facilitySpaces[7]._id,
        name: "CCTV Surveillance System", category: "Security",
        description: "32-channel IP camera surveillance system", model: "DS-7732NI-K4",
        manufacturer: "Hikvision", serialNumber: "CCTV-2022-008",
        purchaseDate: new Date("2022-09-01"), purchaseCost: 4800000,
        status: "in-service", condition: "Good", conditionRating: 4,
        maintenanceStrategy: "PdM", usefulLife: 8, replacementCost: 5500000,
      },
      {
        site: sites[0]._id, building: buildings[1]._id, facilitySpace: facilitySpaces[4]._id,
        name: "UPS System 40kVA", category: "Electrical",
        description: "Uninterruptible power supply for tech hub", model: "Galaxy VS",
        manufacturer: "Schneider Electric", serialNumber: "UPS-2023-002",
        purchaseDate: new Date("2023-02-28"), purchaseCost: 12000000,
        status: "in-service", condition: "Excellent", conditionRating: 5,
        maintenanceStrategy: "PPM", usefulLife: 10, replacementCost: 14000000,
      },
      {
        site: sites[2]._id, building: buildings[5]._id, facilitySpace: facilitySpaces[8]._id,
        name: "Sound System", category: "Other",
        description: "Professional conference hall audio system", model: "JBL VTX V25-II",
        manufacturer: "JBL Professional", serialNumber: "SND-2012-001",
        purchaseDate: new Date("2012-06-15"), purchaseCost: 8000000,
        status: "out-of-service", condition: "Poor", conditionRating: 2,
        maintenanceStrategy: "RTF", usefulLife: 12, replacementCost: 12000000,
      },
    ]);

    // Link assets to facility spaces
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[1]._id, { $push: { assets: [assets[0]._id] } });
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[0]._id, { $push: { assets: [assets[1]._id] } });
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[5]._id, { $push: { assets: [assets[2]._id] } });
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[6]._id, { $push: { assets: [assets[4]._id] } });
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[7]._id, { $push: { assets: [assets[5]._id] } });
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[4]._id, { $push: { assets: [assets[6]._id] } });
    await FacilitySpace.findByIdAndUpdate(facilitySpaces[8]._id, { $push: { assets: [assets[7]._id] } });

    // ─── 5. Equipment ───
    await Equipment.insertMany([
      { name: "Multimeter (Fluke 87V)", details: "Digital multimeter for electrical measurements", condition: "Good", checked: true },
      { name: "Thermal Imaging Camera", details: "FLIR E8 Pro for predictive maintenance inspections", condition: "Good", checked: true },
      { name: "Pipe Wrench Set (24\")", details: "Heavy-duty pipe wrench for plumbing maintenance", condition: "Needs Repair", checked: false },
      { name: "Cordless Drill Kit", details: "DeWalt 20V MAX cordless drill with accessories", condition: "Good", checked: true },
      { name: "Scaffolding Set", details: "Aluminum scaffolding for elevated maintenance work", condition: "Good", checked: false },
      { name: "Concrete Mixer", details: "Portable concrete mixer for minor structural repairs", condition: "Replace Soon", checked: false },
    ]);

    // ─── 6. Teams ───
    await Team.insertMany([
      { name: "Adebayo Ogundimu", role: "Facility Manager", type: "Specialist", phone: "+234 801 234 5678", notes: "Overall facility operations lead" },
      { name: "Chinwe Okafor", role: "Maintenance Supervisor", type: "Specialist", phone: "+234 802 345 6789", notes: "Manages planned maintenance schedules" },
      { name: "Emeka Nwankwo", role: "HVAC Technician", type: "Specialist", phone: "+234 803 456 7890", notes: "Certified HVAC systems specialist" },
      { name: "Fatima Bello", role: "Electrician", type: "Specialist", phone: "+234 804 567 8901", notes: "Licensed electrical systems engineer" },
      { name: "Gbenga Adeyemi", role: "Plumber", type: "Worker", phone: "+234 805 678 9012", notes: "General plumbing and water systems" },
      { name: "Halima Yusuf", role: "Safety Officer", type: "Specialist", phone: "+234 806 789 0123", notes: "HSSE compliance and audit lead" },
      { name: "Ibrahim Danjuma", role: "Security Supervisor", type: "Specialist", phone: "+234 807 890 1234", notes: "Physical security operations" },
      { name: "Joy Eze", role: "General Maintenance", type: "Worker", phone: "+234 808 901 2345", notes: "Multi-skilled maintenance worker" },
    ]);

    // ─── 7. Budgets ───
    await Budget.insertMany([
      {
        site: sites[0]._id, building: buildings[0]._id,
        title: "Admin Tower Operational Budget FY2025", fiscalYear: 2025,
        description: "Operational expenditure budget for the main administration tower",
        budgetType: "OPEX", costCenter: "OPS-001", status: "approved",
        lineItems: [
          { category: "Utilities", subCategory: "Electricity", description: "PHCN & generator fuel costs", budgetedAmount: 18000000, actualAmount: 16500000, month: 1 },
          { category: "Utilities", subCategory: "Water", description: "Municipal water supply", budgetedAmount: 2400000, actualAmount: 2100000, month: 1 },
          { category: "Maintenance", subCategory: "Preventive", description: "PPM contracts and materials", budgetedAmount: 8500000, actualAmount: 7800000, month: 1 },
          { category: "Cleaning", subCategory: "Janitorial", description: "Cleaning services contract", budgetedAmount: 4200000, actualAmount: 4200000, month: 1 },
          { category: "Security", subCategory: "Personnel", description: "Security guard services", budgetedAmount: 6000000, actualAmount: 5800000, month: 1 },
        ],
        totalBudgeted: 39100000, totalActual: 36400000, totalVariance: 2700000,
      },
      {
        site: sites[1]._id,
        title: "Lekki CAPEX Budget FY2025", fiscalYear: 2025,
        description: "Capital expenditure for warehouse infrastructure upgrades",
        budgetType: "CAPEX", costCenter: "CAP-002", status: "submitted",
        lineItems: [
          { category: "Equipment", subCategory: "Generator", description: "New standby generator procurement", budgetedAmount: 52000000, actualAmount: 0 },
          { category: "Infrastructure", subCategory: "Roofing", description: "Warehouse A roof replacement", budgetedAmount: 15000000, actualAmount: 3500000 },
          { category: "IT", subCategory: "Network", description: "Fiber optic network upgrade", budgetedAmount: 8000000, actualAmount: 0 },
        ],
        totalBudgeted: 75000000, totalActual: 3500000, totalVariance: 71500000,
      },
      {
        site: sites[2]._id, building: buildings[5]._id,
        title: "Conference Center Renovation Budget", fiscalYear: 2025,
        description: "Budget for conference center renovation and sound system replacement",
        budgetType: "CAPEX", costCenter: "CAP-003", status: "approved",
        lineItems: [
          { category: "Construction", subCategory: "Interior", description: "Interior renovation works", budgetedAmount: 25000000, actualAmount: 18000000 },
          { category: "Equipment", subCategory: "Audio", description: "New sound system installation", budgetedAmount: 12000000, actualAmount: 0 },
          { category: "Furniture", subCategory: "Seating", description: "Conference seating replacement", budgetedAmount: 8000000, actualAmount: 6500000 },
        ],
        totalBudgeted: 45000000, totalActual: 24500000, totalVariance: 20500000,
      },
    ]);

    // ─── 8. Work Orders ───
    const now = new Date();
    await WorkOrder.insertMany([
      {
        asset: assets[1]._id, site: sites[0]._id, building: buildings[0]._id,
        title: "HVAC System Quarterly Servicing",
        description: "Scheduled quarterly maintenance for central AC system including filter replacement and refrigerant check",
        type: "preventive", priority: "medium", status: "in-progress",
        requestedBy: "Adebayo Ogundimu", assignedTo: "Emeka Nwankwo",
        scheduledDate: new Date(now.getTime() - 3 * 86400000),
        dueDate: new Date(now.getTime() + 4 * 86400000),
        estimatedHours: 8, actualHours: 5, laborCost: 150000, materialCost: 320000,
      },
      {
        asset: assets[3]._id, site: sites[0]._id, building: buildings[0]._id,
        title: "Elevator Annual Safety Inspection",
        description: "Annual statutory safety inspection and certification renewal for passenger elevator",
        type: "inspection", priority: "high", status: "assigned",
        requestedBy: "Chinwe Okafor", assignedTo: "Otis Nigeria Ltd",
        scheduledDate: new Date(now.getTime() + 7 * 86400000),
        dueDate: new Date(now.getTime() + 14 * 86400000),
        estimatedHours: 16, laborCost: 450000, materialCost: 0,
      },
      {
        asset: assets[2]._id, site: sites[1]._id, building: buildings[2]._id,
        title: "Generator Oil Change & Filter Replacement",
        description: "Routine oil change and filter replacement at 500-hour interval",
        type: "preventive", priority: "medium", status: "completed",
        requestedBy: "Auto-Generated", assignedTo: "Chinwe Okafor",
        scheduledDate: new Date(now.getTime() - 14 * 86400000),
        completedDate: new Date(now.getTime() - 10 * 86400000),
        estimatedHours: 4, actualHours: 3.5, laborCost: 80000, materialCost: 250000,
        resolution: "Oil and filters replaced. Generator tested and running within specifications.",
      },
      {
        site: sites[2]._id, building: buildings[5]._id,
        title: "Conference Hall Ceiling Water Leak Repair",
        description: "Water leak detected in conference hall ceiling. Suspected roof membrane damage.",
        type: "reactive", priority: "high", status: "open",
        requestedBy: "Musa Ibrahim",
        dueDate: new Date(now.getTime() + 3 * 86400000),
        estimatedHours: 12, laborCost: 0, materialCost: 0,
      },
      {
        asset: assets[4]._id, site: sites[1]._id, building: buildings[3]._id,
        title: "Fire Alarm Panel Battery Replacement",
        description: "Replace backup batteries in fire alarm control panel as part of semi-annual maintenance",
        type: "preventive", priority: "critical", status: "assigned",
        requestedBy: "Halima Yusuf", assignedTo: "Fatima Bello",
        scheduledDate: new Date(now.getTime() + 2 * 86400000),
        dueDate: new Date(now.getTime() + 5 * 86400000),
        estimatedHours: 2, laborCost: 50000, materialCost: 180000,
      },
    ]);

    // ─── 9. Maintenance Plans ───
    await MaintenancePlan.insertMany([
      {
        asset: assets[1]._id, site: sites[0]._id, building: buildings[0]._id,
        title: "HVAC Preventive Maintenance Plan",
        description: "Quarterly preventive maintenance for central AC system including coil cleaning, refrigerant check, and filter replacement",
        maintenanceType: "PPM", frequency: "quarterly", priority: "high",
        startDate: new Date("2025-01-01"), assignedTo: "Emeka Nwankwo",
        nextDueDate: new Date(now.getTime() + 30 * 86400000),
        estimatedCost: 1500000, status: "active",
        tasks: [
          { task: "Check refrigerant levels", completed: true, completedDate: new Date(now.getTime() - 60 * 86400000) },
          { task: "Clean evaporator coils", completed: true, completedDate: new Date(now.getTime() - 60 * 86400000) },
          { task: "Replace air filters", completed: false },
          { task: "Inspect ductwork for leaks", completed: false },
          { task: "Test thermostat calibration", completed: false },
        ],
      },
      {
        asset: assets[2]._id, site: sites[1]._id, building: buildings[2]._id,
        title: "Generator Routine Maintenance",
        description: "Monthly generator maintenance including oil check, battery test, and load bank testing",
        maintenanceType: "PPM", frequency: "monthly", priority: "critical",
        startDate: new Date("2025-01-01"), assignedTo: "Chinwe Okafor",
        nextDueDate: new Date(now.getTime() + 15 * 86400000),
        estimatedCost: 500000, status: "active",
        tasks: [
          { task: "Check oil level and pressure", completed: false },
          { task: "Test battery voltage", completed: false },
          { task: "Inspect coolant level", completed: false },
          { task: "Run load bank test", completed: false },
        ],
      },
      {
        asset: assets[3]._id, site: sites[0]._id, building: buildings[0]._id,
        title: "Elevator Preventive Maintenance",
        description: "Monthly elevator inspection and lubrication of mechanical components",
        maintenanceType: "PPM", frequency: "monthly", priority: "high",
        startDate: new Date("2025-01-01"), assignedTo: "Otis Nigeria Ltd",
        nextDueDate: new Date(now.getTime() + 20 * 86400000),
        estimatedCost: 350000, status: "active",
        tasks: [
          { task: "Lubricate guide rails", completed: false },
          { task: "Check door sensors", completed: false },
          { task: "Test emergency stop", completed: false },
          { task: "Inspect cables and sheaves", completed: false },
        ],
      },
      {
        asset: assets[5]._id, site: sites[2]._id, building: buildings[4]._id,
        title: "CCTV System Health Check",
        description: "Predictive maintenance using system diagnostics and image quality analysis",
        maintenanceType: "PdM", frequency: "quarterly", priority: "medium",
        startDate: new Date("2025-01-01"), assignedTo: "Ibrahim Danjuma",
        nextDueDate: new Date(now.getTime() + 45 * 86400000),
        estimatedCost: 200000, status: "active",
        tasks: [
          { task: "Check camera image quality", completed: false },
          { task: "Verify NVR storage capacity", completed: false },
          { task: "Test motion detection sensitivity", completed: false },
          { task: "Inspect cable connections", completed: false },
        ],
      },
    ]);

    // ─── 10. Incidents ───
    await Incident.insertMany([
      {
        site: sites[0]._id, building: buildings[0]._id,
        title: "Elevator Entrapment on 8th Floor",
        description: "Two staff members were trapped in the passenger elevator between floors 7 and 8 for approximately 25 minutes due to power fluctuation.",
        incidentDate: new Date(now.getTime() - 30 * 86400000),
        reportedBy: "Adebayo Ogundimu", type: "equipment-failure", severity: "moderate",
        location: "Admin Tower - Elevator Shaft",
        involvedPersons: [{ name: "Olumide Ajayi", role: "Staff", contact: "+234 809 111 2222" }, { name: "Blessing Okoro", role: "Staff", contact: "+234 809 333 4444" }],
        immediateAction: "Emergency power backup activated. Elevator technician on-site within 20 minutes.",
        rootCause: "UPS switchover delay during PHCN power outage",
        correctiveAction: "UPS switchover time calibrated. Emergency lighting installed in elevator car.",
        status: "resolved",
      },
      {
        site: sites[1]._id, building: buildings[3]._id,
        title: "Chemical Spill in Workshop",
        description: "Minor hydraulic fluid spill (~5 liters) in mechanical workshop during equipment maintenance.",
        incidentDate: new Date(now.getTime() - 10 * 86400000),
        reportedBy: "Halima Yusuf", type: "environmental", severity: "minor",
        location: "Workshop Block - Bay 3",
        immediateAction: "Spill contained using absorbent pads. Area ventilated.",
        rootCause: "Worn hydraulic hose on forklift",
        correctiveAction: "Replaced hydraulic hose. Updated spill response kit.",
        preventiveAction: "Quarterly inspection of all hydraulic equipment hoses",
        status: "closed",
      },
      {
        site: sites[0]._id, building: buildings[0]._id,
        title: "Slip and Fall in Lobby",
        description: "Visitor slipped on wet floor in the main lobby during cleaning hours.",
        incidentDate: new Date(now.getTime() - 5 * 86400000),
        reportedBy: "Ibrahim Danjuma", type: "injury", severity: "minor",
        location: "Admin Tower - Ground Floor Lobby",
        involvedPersons: [{ name: "Guest Visitor", role: "Visitor" }],
        immediateAction: "First aid administered. Wet floor signs were already in place.",
        status: "investigating",
      },
    ]);

    // ─── 11. FCA Assessments ───
    await FCAAssessment.insertMany([
      {
        site: sites[0]._id, building: buildings[0]._id,
        assessmentDate: new Date(now.getTime() - 60 * 86400000),
        assessor: "Engr. Tunji Oladele", title: "Admin Tower Annual FCA 2025",
        description: "Comprehensive facility condition assessment of the Admin Tower covering all building systems",
        overallConditionRating: 4, currentReplacementValue: 2500000000,
        totalDeficiencyCost: 85000000, facilityConditionIndex: 0.034,
        defects: [
          { location: "Roof Level", system: "Roofing", description: "Minor membrane degradation on south-facing section", conditionRating: 3, estimatedCost: 12000000, priority: "medium", status: "scheduled" },
          { location: "Basement", system: "Plumbing", description: "Corroded underground drainage pipes", conditionRating: 2, estimatedCost: 25000000, priority: "high", status: "identified" },
          { location: "All Floors", system: "Electrical", description: "Aging distribution boards need upgrade", conditionRating: 3, estimatedCost: 18000000, priority: "medium", status: "identified" },
          { location: "Exterior", system: "Exterior", description: "Paint peeling and minor cracks on west facade", conditionRating: 3, estimatedCost: 8000000, priority: "low", status: "deferred" },
        ],
        systemRatings: [
          { system: "Structural", rating: 5, notes: "Excellent structural integrity" },
          { system: "Mechanical", rating: 4, notes: "HVAC in good condition, regular PPM" },
          { system: "Electrical", rating: 3, notes: "Distribution boards aging, upgrade recommended" },
          { system: "Plumbing", rating: 2, notes: "Underground drainage needs replacement" },
          { system: "Fire-Safety", rating: 4, notes: "All systems tested and functional" },
        ],
        status: "approved",
        recommendations: "Priority: Replace underground drainage. Schedule electrical distribution board upgrade within 12 months.",
      },
      {
        site: sites[2]._id, building: buildings[5]._id,
        assessmentDate: new Date(now.getTime() - 15 * 86400000),
        assessor: "Engr. Amaka Eze", title: "Conference Center Renovation Assessment",
        description: "Pre-renovation condition assessment for the conference center",
        overallConditionRating: 2, currentReplacementValue: 800000000,
        totalDeficiencyCost: 120000000, facilityConditionIndex: 0.15,
        defects: [
          { location: "Roof", system: "Roofing", description: "Multiple leak points in flat roof membrane", conditionRating: 1, estimatedCost: 35000000, priority: "critical", status: "in-progress" },
          { location: "Main Hall", system: "Interior", description: "Water-damaged ceiling tiles and acoustic panels", conditionRating: 2, estimatedCost: 15000000, priority: "high", status: "identified" },
          { location: "Main Hall", system: "Other", description: "Obsolete sound system, non-functional", conditionRating: 1, estimatedCost: 12000000, priority: "high", status: "identified" },
          { location: "All Areas", system: "HVAC", description: "Undersized AC units for hall capacity", conditionRating: 2, estimatedCost: 28000000, priority: "high", status: "identified" },
        ],
        status: "completed",
        recommendations: "Full renovation recommended. Building cannot be used for events until roof and ceiling are repaired.",
      },
    ]);

    // ─── 12. HSSE Audits ───
    await HSSEAudit.insertMany([
      {
        site: sites[0]._id, building: buildings[0]._id,
        title: "Q1 2025 Comprehensive HSSE Audit",
        auditDate: new Date(now.getTime() - 45 * 86400000),
        auditor: "Halima Yusuf", auditType: "comprehensive",
        checklist: [
          { category: "Fire Safety", question: "Are all fire extinguishers serviced and current?", response: "yes" },
          { category: "Fire Safety", question: "Are fire exits clearly marked and unobstructed?", response: "yes" },
          { category: "Fire Safety", question: "Has fire drill been conducted this quarter?", response: "yes" },
          { category: "Electrical", question: "Are all electrical panels properly labeled?", response: "no", comments: "3 panels on floor 6 missing labels" },
          { category: "Electrical", question: "Are extension cords used according to policy?", response: "no", comments: "Daisy-chained extensions found in 2 offices" },
          { category: "PPE", question: "Is appropriate PPE available for all maintenance staff?", response: "yes" },
          { category: "Housekeeping", question: "Are corridors and exits clear of obstructions?", response: "yes" },
          { category: "First Aid", question: "Are first aid kits stocked and accessible?", response: "yes" },
          { category: "Signage", question: "Are safety signs visible and in good condition?", response: "na" },
          { category: "Environment", question: "Is waste segregation being practiced?", response: "no", comments: "Mixed waste in general bins on floors 3 and 7" },
        ],
        totalQuestions: 10, compliantCount: 7, nonCompliantCount: 3, complianceScore: 70,
        ppeItems: [
          { item: "Safety Helmets", available: true, condition: "good", quantity: 20 },
          { item: "Safety Boots", available: true, condition: "fair", quantity: 15 },
          { item: "High-Vis Vests", available: true, condition: "good", quantity: 25 },
          { item: "Safety Goggles", available: true, condition: "good", quantity: 12 },
          { item: "Ear Protection", available: false, condition: "replace", quantity: 0 },
        ],
        status: "approved",
        findings: "Overall compliance at 70%. Key concerns: electrical panel labeling, extension cord usage, and waste management.",
        recommendations: "1. Label all electrical panels within 2 weeks. 2. Remove daisy-chained extensions. 3. Implement waste segregation training.",
      },
    ]);

    // ─── 13. Emergency Plans ───
    await EmergencyPlan.insertMany([
      {
        site: sites[0]._id,
        title: "Eko Atlantic Complex Emergency Response Plan",
        version: "2.1", status: "active",
        risks: [
          { risk: "Fire Outbreak", likelihood: 2, impact: 5, riskPriority: 10, mitigationStrategy: "Fire suppression systems, regular drills, fire warden network", responsiblePerson: "Halima Yusuf" },
          { risk: "Power Failure", likelihood: 4, impact: 3, riskPriority: 12, mitigationStrategy: "UPS backup, generator auto-start, load shedding protocol", responsiblePerson: "Fatima Bello" },
          { risk: "Flood / Water Damage", likelihood: 3, impact: 4, riskPriority: 12, mitigationStrategy: "Sump pumps, flood barriers, drainage maintenance", responsiblePerson: "Gbenga Adeyemi" },
          { risk: "Security Breach", likelihood: 2, impact: 4, riskPriority: 8, mitigationStrategy: "Access control, CCTV monitoring, security patrols", responsiblePerson: "Ibrahim Danjuma" },
        ],
        biaItems: [
          { process: "Data Center Operations", description: "Server and network infrastructure", criticality: "critical", rto: "1 hour", rpo: "15 minutes", maxDowntime: "4 hours", financialImpact: 5000000 },
          { process: "Building Access Control", description: "Entry/exit management systems", criticality: "high", rto: "30 minutes", rpo: "N/A", maxDowntime: "2 hours", financialImpact: 500000 },
        ],
        incidentResponsePlan: "1. Alert → 2. Assess → 3. Activate response team → 4. Contain → 5. Communicate → 6. Recover → 7. Review",
        evacuationProcedure: "Floor wardens initiate evacuation via stairwells. Elevators disabled. Assembly at designated points. Roll call within 10 minutes.",
        assemblyPoints: [
          { name: "Assembly Point A", location: "Main car park - south end" },
          { name: "Assembly Point B", location: "Garden area - east side" },
        ],
        roles: [
          { title: "Emergency Coordinator", person: "Adebayo Ogundimu", responsibilities: ["Overall coordination", "Communication with authorities", "Decision making"], contact: "+234 801 234 5678" },
          { title: "Safety Officer", person: "Halima Yusuf", responsibilities: ["Risk assessment", "Evacuation oversight", "First aid coordination"], contact: "+234 806 789 0123" },
        ],
        contacts: [
          { name: "Lagos Fire Service", role: "Fire Response", organization: "Lagos State", phone: "01-774 0000", type: "external" },
          { name: "LASEMA", role: "Emergency Management", organization: "Lagos State", phone: "0800 LASEMA", type: "external" },
          { name: "Nearest Hospital", role: "Medical", organization: "Reddington Hospital VI", phone: "01-271 5050", type: "external" },
        ],
        drillLogs: [
          { drillType: "Fire Evacuation", date: new Date(now.getTime() - 90 * 86400000), participants: 250, duration: "18 minutes", scenario: "Fire alarm triggered on 8th floor", observations: "Evacuation completed in 12 minutes. Some staff used elevator.", improvements: "Reinforce no-elevator policy. Additional floor warden training.", conductedBy: "Halima Yusuf", passed: true },
        ],
        nextDrillDate: new Date(now.getTime() + 60 * 86400000),
        recoveryPlan: "Business continuity activation: 1) Assess damage 2) Activate DR site 3) Communicate with stakeholders 4) Begin recovery operations",
      },
    ]);

    // ─── 14. Project Management (Space → Project → Tasks) ───
    const space = await Space.create({
      name: "Facility Management Workspace",
      description: "Central workspace for all facility management projects",
    });

    const projects = await Project.insertMany([
      {
        space: space._id, site: sites[0]._id,
        title: "HVAC System Upgrade - Admin Tower",
        purpose: "Replace aging HVAC components with energy-efficient VRV systems to reduce energy costs by 30%",
        scope: "All floors of Admin Tower including ductwork modifications and BMS integration",
        objectives: [
          { text: "Install new VRV outdoor units on roof level" },
          { text: "Replace indoor cassette units on all 12 floors" },
          { text: "Integrate with Building Management System" },
          { text: "Commission and test all zones" },
        ],
        stakeholders: [
          { name: "Adebayo Ogundimu", role: "Project Sponsor", contact: "+234 801 234 5678" },
          { name: "Emeka Nwankwo", role: "Technical Lead", contact: "+234 803 456 7890" },
          { name: "Daikin Nigeria", role: "Equipment Supplier", contact: "info@daikin.ng" },
        ],
        responsibilities: [
          { role: "Project Manager", responsibility: "Overall coordination, timeline management, budget control" },
          { role: "HVAC Engineer", responsibility: "Design review, installation supervision, commissioning" },
          { role: "Electrical Engineer", responsibility: "Power supply upgrades, wiring modifications" },
        ],
        budget: [
          { category: "Equipment", amount: 35000000 },
          { category: "Installation Labor", amount: 8000000 },
          { category: "Electrical Works", amount: 5000000 },
          { category: "BMS Integration", amount: 3000000 },
          { category: "Contingency", amount: 5000000 },
        ],
        risks: "1. Equipment delivery delays from supplier\n2. Disruption to office operations during installation\n3. Unexpected structural modifications needed for ductwork",
        assumptions: "1. Building structure can support new equipment loads\n2. Existing electrical capacity is sufficient\n3. Work can be done floor-by-floor without full building shutdown",
      },
      {
        space: space._id, site: sites[2]._id,
        title: "Conference Center Full Renovation",
        purpose: "Complete renovation of the Abuja conference center to restore functionality and modernize facilities",
        scope: "Roof repair, interior renovation, sound system replacement, HVAC upgrade, and AV equipment installation",
        objectives: [
          { text: "Repair roof membrane and eliminate all leak points" },
          { text: "Replace ceiling tiles and acoustic treatment" },
          { text: "Install new professional sound and AV system" },
          { text: "Upgrade HVAC to match hall capacity requirements" },
        ],
        stakeholders: [
          { name: "Musa Ibrahim", role: "Project Sponsor", contact: "+234 803 456 7890" },
          { name: "Engr. Amaka Eze", role: "Lead Consultant", contact: "amaka@consultants.ng" },
        ],
        budget: [
          { category: "Roofing", amount: 35000000 },
          { category: "Interior Works", amount: 25000000 },
          { category: "Sound & AV", amount: 15000000 },
          { category: "HVAC", amount: 28000000 },
          { category: "Contingency", amount: 10000000 },
        ],
        risks: "1. Roof damage may be more extensive than assessed\n2. Asbestos presence in old ceiling materials\n3. Budget overruns due to scope changes",
        assumptions: "1. Building structural integrity is confirmed\n2. No asbestos present\n3. Renovation can be completed within 6 months",
      },
      {
        space: space._id, site: sites[1]._id,
        title: "Warehouse Security System Upgrade",
        purpose: "Upgrade the security infrastructure at Lekki Industrial Park to enhance asset protection and personnel safety",
        scope: "CCTV expansion, access control installation, perimeter intrusion detection, and central monitoring setup",
        objectives: [
          { text: "Expand CCTV coverage to 100% of warehouse perimeter" },
          { text: "Install biometric access control at all entry points" },
          { text: "Deploy perimeter intrusion detection sensors" },
          { text: "Set up 24/7 central monitoring station" },
        ],
        stakeholders: [
          { name: "Chinwe Okafor", role: "Project Sponsor", contact: "+234 802 345 6789" },
          { name: "Ibrahim Danjuma", role: "Security Lead", contact: "+234 807 890 1234" },
        ],
        budget: [
          { category: "CCTV Equipment", amount: 8000000 },
          { category: "Access Control", amount: 5000000 },
          { category: "Perimeter Detection", amount: 4000000 },
          { category: "Monitoring Station", amount: 3000000 },
          { category: "Installation", amount: 4000000 },
        ],
        risks: "1. Power supply reliability for 24/7 operations\n2. Network bandwidth limitations for IP cameras\n3. Integration challenges with existing systems",
        assumptions: "1. Stable power supply (generator backup available)\n2. Existing network infrastructure can support additional cameras\n3. All areas are physically accessible for installation",
      },
    ]);

    // Create Tasks linked to projects
    const tasks = await Task.insertMany([
      // Project 1: HVAC Upgrade tasks
      { name: "Site Survey & System Design", description: "Conduct detailed site survey and finalize HVAC system design", status: "done", projectId: projects[0]._id, spaceId: space._id, startDate: new Date("2025-01-15"), dueDate: new Date("2025-02-15"), priority: "high", progress: 100, type: "phase", assignee: { name: "Emeka Nwankwo", email: "emeka@company.ng" } },
      { name: "Equipment Procurement", description: "Order VRV units, cassettes, piping, and accessories from Daikin", status: "done", projectId: projects[0]._id, spaceId: space._id, startDate: new Date("2025-02-16"), dueDate: new Date("2025-04-01"), priority: "high", progress: 100, type: "task", assignee: { name: "Adebayo Ogundimu", email: "adebayo@company.ng" } },
      { name: "Floor 1-4 Installation", description: "Install new HVAC units on floors 1 through 4", status: "inprogress", projectId: projects[0]._id, spaceId: space._id, startDate: new Date("2025-04-15"), dueDate: new Date("2025-06-01"), priority: "high", progress: 60, type: "task", assignee: { name: "Emeka Nwankwo", email: "emeka@company.ng" } },
      { name: "Floor 5-8 Installation", description: "Install new HVAC units on floors 5 through 8", status: "todo", projectId: projects[0]._id, spaceId: space._id, startDate: new Date("2025-06-02"), dueDate: new Date("2025-07-15"), priority: "medium", type: "task" },
      { name: "Floor 9-12 Installation", description: "Install new HVAC units on floors 9 through 12", status: "todo", projectId: projects[0]._id, spaceId: space._id, startDate: new Date("2025-07-16"), dueDate: new Date("2025-08-30"), priority: "medium", type: "task" },
      { name: "BMS Integration & Commissioning", description: "Integrate all HVAC units with Building Management System", status: "todo", projectId: projects[0]._id, spaceId: space._id, startDate: new Date("2025-09-01"), dueDate: new Date("2025-09-30"), priority: "high", type: "milestone", assignee: { name: "Emeka Nwankwo", email: "emeka@company.ng" } },

      // Project 2: Conference Center tasks
      { name: "Roof Membrane Replacement", description: "Remove old membrane and install new waterproof roofing system", status: "inprogress", projectId: projects[1]._id, spaceId: space._id, startDate: new Date("2025-03-01"), dueDate: new Date("2025-04-30"), priority: "critical", progress: 40, type: "task", assignee: { name: "Contractor - RoofTech Ltd", email: "info@rooftech.ng" } },
      { name: "Interior Demolition", description: "Remove damaged ceiling tiles, panels, and old fixtures", status: "todo", projectId: projects[1]._id, spaceId: space._id, startDate: new Date("2025-05-01"), dueDate: new Date("2025-05-31"), priority: "high", type: "task" },
      { name: "New Ceiling & Acoustics", description: "Install new acoustic ceiling system and panels", status: "todo", projectId: projects[1]._id, spaceId: space._id, startDate: new Date("2025-06-01"), dueDate: new Date("2025-07-15"), priority: "medium", type: "task" },
      { name: "Sound & AV System Install", description: "Install professional JBL sound system and AV equipment", status: "todo", projectId: projects[1]._id, spaceId: space._id, startDate: new Date("2025-07-16"), dueDate: new Date("2025-08-31"), priority: "high", type: "task" },
      { name: "HVAC Upgrade", description: "Replace undersized AC units with appropriately sized systems", status: "todo", projectId: projects[1]._id, spaceId: space._id, startDate: new Date("2025-06-01"), dueDate: new Date("2025-08-15"), priority: "high", type: "task" },

      // Project 3: Security Upgrade tasks
      { name: "Security Assessment", description: "Conduct comprehensive security vulnerability assessment", status: "done", projectId: projects[2]._id, spaceId: space._id, startDate: new Date("2025-02-01"), dueDate: new Date("2025-02-28"), priority: "high", progress: 100, type: "phase", assignee: { name: "Ibrahim Danjuma", email: "ibrahim@company.ng" } },
      { name: "CCTV Camera Installation", description: "Install additional IP cameras for 100% perimeter coverage", status: "inprogress", projectId: projects[2]._id, spaceId: space._id, startDate: new Date("2025-03-15"), dueDate: new Date("2025-05-15"), priority: "high", progress: 35, type: "task", assignee: { name: "Ibrahim Danjuma", email: "ibrahim@company.ng" } },
      { name: "Access Control Deployment", description: "Install biometric readers at all entry/exit points", status: "todo", projectId: projects[2]._id, spaceId: space._id, startDate: new Date("2025-05-16"), dueDate: new Date("2025-07-01"), priority: "high", type: "task" },
      { name: "Monitoring Station Setup", description: "Configure central monitoring station with alarm integration", status: "todo", projectId: projects[2]._id, spaceId: space._id, startDate: new Date("2025-07-02"), dueDate: new Date("2025-08-15"), priority: "medium", type: "task" },
    ]);

    // Link tasks to projects
    await Project.findByIdAndUpdate(projects[0]._id, { $push: { tasks: { $each: tasks.filter(t => t.projectId?.toString() === projects[0]._id.toString()).map(t => t._id) } } });
    await Project.findByIdAndUpdate(projects[1]._id, { $push: { tasks: { $each: tasks.filter(t => t.projectId?.toString() === projects[1]._id.toString()).map(t => t._id) } } });
    await Project.findByIdAndUpdate(projects[2]._id, { $push: { tasks: { $each: tasks.filter(t => t.projectId?.toString() === projects[2]._id.toString()).map(t => t._id) } } });

    // Link projects to space
    await Space.findByIdAndUpdate(space._id, { $push: { projects: { $each: projects.map(p => p._id) } } });

    // ─── 15. Project-scoped Equipment ───
    const projectEquipment = await Equipment.insertMany([
      { name: "VRV Outdoor Unit (20HP)", details: "Daikin VRV IV heat recovery outdoor unit for HVAC project", condition: "Good", checked: false, projectId: projects[0]._id },
      { name: "Refrigerant Recovery Machine", details: "Portable refrigerant recovery unit for HVAC decommissioning", condition: "Good", checked: true, projectId: projects[0]._id },
      { name: "Copper Pipe Cutter Set", details: "Professional pipe cutting tools for HVAC installation", condition: "Good", checked: true, projectId: projects[0]._id },
      { name: "Roofing Membrane Roll (TPO)", details: "Single-ply TPO membrane for flat roof replacement", condition: "Good", checked: false, projectId: projects[1]._id },
      { name: "Acoustic Ceiling Tiles (Box 20)", details: "Armstrong acoustic ceiling panels for conference hall", condition: "Good", checked: false, projectId: projects[1]._id },
      { name: "IP Camera (Hikvision 4MP)", details: "Outdoor bullet camera with IR for CCTV expansion", condition: "Good", checked: false, projectId: projects[2]._id },
      { name: "Biometric Access Reader", details: "ZKTeco fingerprint + card reader for access control", condition: "Good", checked: false, projectId: projects[2]._id },
      { name: "Network Switch (48-Port PoE)", details: "Cisco Catalyst PoE switch for camera network", condition: "Good", checked: true, projectId: projects[2]._id },
    ]);

    // ─── 16. Additional tasks with assignee for "Tasks Assigned to Me" ───
    // These tasks are assigned to a demo admin user so they show up in the assigned tasks view
    const additionalTasks = await Task.insertMany([
      {
        name: "Review HVAC design specifications",
        description: "Review and approve the final HVAC system design before procurement",
        status: "inprogress", projectId: projects[0]._id, spaceId: space._id,
        startDate: new Date("2025-04-01"), dueDate: new Date(new Date().getTime() + 2 * 86400000),
        priority: "high", progress: 50, type: "task",
        assignee: { name: "Admin User", email: "admin@opalshire.com" },
      },
      {
        name: "Approve conference center renovation budget",
        description: "Review contractor bids and approve the final renovation budget allocation",
        status: "todo", projectId: projects[1]._id, spaceId: space._id,
        startDate: new Date("2025-05-01"), dueDate: new Date(new Date().getTime() - 1 * 86400000),
        priority: "high", type: "task",
        assignee: { name: "Admin User", email: "admin@opalshire.com" },
      },
      {
        name: "Inspect security camera installation progress",
        description: "On-site inspection of newly installed CCTV cameras for quality assurance",
        status: "todo", projectId: projects[2]._id, spaceId: space._id,
        startDate: new Date("2025-04-15"), dueDate: new Date(new Date().getTime() + 0 * 86400000),
        priority: "medium", type: "task",
        assignee: { name: "Admin User", email: "admin@opalshire.com" },
      },
      {
        name: "Prepare monthly project status report",
        description: "Compile status updates from all three active projects for management review",
        status: "todo", projectId: projects[0]._id, spaceId: space._id,
        startDate: new Date("2025-04-20"), dueDate: new Date(new Date().getTime() + 5 * 86400000),
        priority: "medium", type: "task",
        assignee: { name: "Admin User", email: "admin@opalshire.com" },
      },
    ]);

    // Link additional tasks to projects
    await Project.findByIdAndUpdate(projects[0]._id, { $push: { tasks: { $each: [additionalTasks[0]._id, additionalTasks[3]._id] } } });
    await Project.findByIdAndUpdate(projects[1]._id, { $push: { tasks: additionalTasks[1]._id } });
    await Project.findByIdAndUpdate(projects[2]._id, { $push: { tasks: additionalTasks[2]._id } });

    return res.status(200).json({
      success: true,
      message: "Seed data created successfully",
      counts: {
        sites: sites.length,
        buildings: buildings.length,
        facilitySpaces: facilitySpaces.length,
        assets: assets.length,
        equipment: 6 + projectEquipment.length,
        teams: 8,
        budgets: 3,
        workOrders: 5,
        maintenancePlans: 4,
        incidents: 3,
        fcaAssessments: 2,
        hsseAudits: 1,
        emergencyPlans: 1,
        projects: projects.length,
        tasks: tasks.length + additionalTasks.length,
        projectEquipment: projectEquipment.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return res.status(500).json({ error: error.message || "Failed to seed data" });
  }
}
