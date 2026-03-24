import { useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, Button,
} from "@/components/ui/SharedComponents";
import {
  MapPin, Flame, Zap, Droplets, Wind, ChevronDown, ChevronRight,
  ThermometerSun, Fan, CircuitBoard, Plug, Lightbulb, ShieldCheck,
  PipetteIcon, Waves,
} from "lucide-react";

const MEP_SYSTEMS = [
  {
    id: "mechanical",
    title: "Mechanical Systems",
    icon: ThermometerSun,
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    description: "Heating, Ventilation, and Air Conditioning (HVAC) systems",
    subsystems: [
      { name: "HVAC Central Plant", description: "Chillers, boilers, cooling towers, and heat exchangers", locations: [] },
      { name: "Air Handling Units (AHU)", description: "Air supply, return, and exhaust systems", locations: [] },
      { name: "Ductwork & Distribution", description: "Supply and return air ducts, dampers, and diffusers", locations: [] },
      { name: "Fan Coil Units (FCU)", description: "Local heating and cooling units in individual zones", locations: [] },
      { name: "Building Management System (BMS)", description: "Centralized monitoring and control of HVAC systems", locations: [] },
      { name: "Ventilation & Exhaust", description: "Fresh air intake, exhaust fans, and kitchen hoods", locations: [] },
      { name: "Refrigeration", description: "Cold rooms, refrigerant piping, and compressors", locations: [] },
    ],
  },
  {
    id: "electrical",
    title: "Electrical Systems",
    icon: Zap,
    color: "amber",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    description: "Lighting, power distribution, and backup systems",
    subsystems: [
      { name: "Main Distribution Board (MDB)", description: "Primary power distribution panels and switchgear", locations: [] },
      { name: "Sub-Distribution Boards (SDB)", description: "Floor-level and zone power distribution", locations: [] },
      { name: "Transformers", description: "Step-down transformers and voltage regulation", locations: [] },
      { name: "Emergency Power / Generators", description: "Standby generators, UPS systems, and ATS panels", locations: [] },
      { name: "Lighting Systems", description: "Interior, exterior, and emergency lighting fixtures and controls", locations: [] },
      { name: "Power Outlets & Circuits", description: "General and dedicated power circuits, socket outlets", locations: [] },
      { name: "Lightning Protection", description: "Lightning conductors, earthing, and surge protection", locations: [] },
      { name: "Low Voltage Systems", description: "Data/telecom cabling, CCTV, access control, and fire alarm wiring", locations: [] },
    ],
  },
  {
    id: "plumbing",
    title: "Plumbing Systems",
    icon: Droplets,
    color: "blue",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    description: "Water supply, drainage, and waste management systems",
    subsystems: [
      { name: "Potable Water Supply", description: "Cold and hot water supply lines, meters, and pressure boosters", locations: [] },
      { name: "Water Storage", description: "Overhead tanks, underground reservoirs, and break tanks", locations: [] },
      { name: "Sanitary Drainage", description: "Soil, waste, and vent pipes; floor drains and traps", locations: [] },
      { name: "Stormwater Drainage", description: "Roof drainage, gutter systems, and stormwater pipes", locations: [] },
      { name: "Sewage / Wastewater", description: "Sewage treatment, grease traps, and pump stations", locations: [] },
      { name: "Water Heaters & Calorifiers", description: "Hot water generation and distribution systems", locations: [] },
      { name: "Fire Hydrant & Sprinkler Piping", description: "Fire suppression water supply and distribution", locations: [] },
      { name: "Gas Supply", description: "LPG/natural gas piping, regulators, and safety valves", locations: [] },
    ],
  },
];

export default function MapsPage() {
  const [expandedSystem, setExpandedSystem] = useState("mechanical");
  const [expandedSub, setExpandedSub] = useState(null);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="MEP Location Maps"
          subtitle="Mechanical, Electrical & Plumbing systems overview"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Maps" }]}
        />

        {/* MEP Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {MEP_SYSTEMS.map((system) => {
            const Icon = system.icon;
            return (
              <button
                key={system.id}
                onClick={() => setExpandedSystem(expandedSystem === system.id ? null : system.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  expandedSystem === system.id
                    ? `${system.borderColor} ${system.bgColor} shadow-md`
                    : "border-gray-200 bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${system.bgColor}`}>
                    <Icon size={22} className={system.textColor} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{system.title}</h3>
                    <p className="text-xs text-gray-500">{system.subsystems.length} subsystems</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{system.description}</p>
              </button>
            );
          })}
        </div>

        {/* Expanded System Detail */}
        {expandedSystem && (() => {
          const system = MEP_SYSTEMS.find(s => s.id === expandedSystem);
          if (!system) return null;
          const Icon = system.icon;
          return (
            <div className={`bg-white rounded-xl border-2 ${system.borderColor} overflow-hidden mb-8`}>
              <div className={`px-6 py-4 ${system.bgColor} border-b ${system.borderColor}`}>
                <div className="flex items-center gap-3">
                  <Icon size={24} className={system.textColor} />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{system.title}</h2>
                    <p className="text-sm text-gray-600">{system.description}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {system.subsystems.map((sub, idx) => {
                  const isOpen = expandedSub === `${system.id}-${idx}`;
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => setExpandedSub(isOpen ? null : `${system.id}-${idx}`)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${system.bgColor} flex items-center justify-center text-xs font-bold ${system.textColor}`}>
                            {idx + 1}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{sub.name}</p>
                            <p className="text-xs text-gray-500">{sub.description}</p>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown size={16} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 bg-gray-50">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin size={16} className={system.textColor} />
                              <h4 className="text-sm font-semibold text-gray-700">System Components & Locations</h4>
                            </div>
                            <p className="text-sm text-gray-500 italic">
                              Locations and specific component details for {sub.name} can be mapped once the building sites and spaces are fully configured.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Key Components</p>
                                <p className="text-sm text-gray-700">{sub.description}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Maintenance Focus</p>
                                <p className="text-sm text-gray-700">Regular inspection, preventive maintenance, and condition monitoring</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">MEP Systems Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-50"><ThermometerSun size={18} className="text-red-600" /></div>
              <div>
                <p className="font-medium text-sm text-gray-900">Mechanical (M)</p>
                <p className="text-xs text-gray-500">HVAC, ventilation, refrigeration, lifts & escalators</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50"><Zap size={18} className="text-amber-600" /></div>
              <div>
                <p className="font-medium text-sm text-gray-900">Electrical (E)</p>
                <p className="text-xs text-gray-500">Power distribution, lighting, low voltage, backup systems</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50"><Droplets size={18} className="text-blue-600" /></div>
              <div>
                <p className="font-medium text-sm text-gray-900">Plumbing (P)</p>
                <p className="text-xs text-gray-500">Water supply, drainage, waste, fire suppression piping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
