import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  MapPin, Flame, Zap, Droplets, Wind, ChevronDown, ChevronRight,
  ThermometerSun, Fan, CircuitBoard, Plug, Lightbulb, ShieldCheck,
  PipetteIcon, Waves, Upload, Trash2, FileText, Eye, Plus,
  Building2, Building, Armchair, Radio, ZoomIn, ZoomOut, RotateCw,
  Maximize2, Minimize2, X, Download,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import fetchWithAuth from "@/lib/fetchWithAuth";

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

const DRAWING_CATEGORIES = [
  {
    id: "architectural",
    title: "Architectural Drawing",
    description: "The combination of all functional drawings - layout plans, elevations, sections, and details",
    icon: Building2,
    color: "bg-slate-50 border-slate-200 text-slate-600",
  },
  {
    id: "mechanical",
    title: "Mechanical (HVAC) Drawing",
    description: "Heating, ventilation, and air conditioning systems - ductwork, equipment schedules, piping",
    icon: ThermometerSun,
    color: "bg-red-50 border-red-200 text-red-600",
  },
  {
    id: "electrical",
    title: "Electrical Drawing",
    description: "Lighting, power distribution, backup systems - panel schedules, circuit layouts",
    icon: Zap,
    color: "bg-amber-50 border-amber-200 text-amber-600",
  },
  {
    id: "plumbing",
    title: "Plumbing Drawing",
    description: "Water supply, drainage, and waste management systems - riser diagrams, fixture schedules",
    icon: Droplets,
    color: "bg-blue-50 border-blue-200 text-blue-600",
  },
  {
    id: "structural",
    title: "Structural Drawing",
    description: "Layout details for all functional drawings including mechanical, electrical, and plumbing",
    icon: Building,
    color: "bg-gray-50 border-gray-200 text-gray-600",
  },
  {
    id: "interior-design",
    title: "Interior Design Drawing",
    description: "Furniture, fittings, finishes, and spatial planning layouts",
    icon: Armchair,
    color: "bg-pink-50 border-pink-200 text-pink-600",
  },
  {
    id: "elv",
    title: "ELV (Extra Low Voltage) Drawing",
    description: "Internet/data systems, sound systems, automation systems, CCTV, access control",
    icon: Radio,
    color: "bg-purple-50 border-purple-200 text-purple-600",
  },
];

export default function MapsPage() {
  const [expandedSystem, setExpandedSystem] = useState("mechanical");
  const [expandedSub, setExpandedSub] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("systems");

  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewerRef = useRef(null);

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const res = await fetchWithAuth("/api/maps/drawings");
      if (res.ok) {
        const data = await res.json();
        setDrawings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch drawings:", err);
    }
  };

  const handleUploadDrawing = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!uploadCategory) return toast.error("Select a drawing category");
    if (!uploadTitle.trim()) return toast.error("Enter a drawing title");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const url = uploadRes.data.links?.[0];
      if (!url) throw new Error("Upload failed");

      const drawing = {
        title: uploadTitle.trim(),
        category: uploadCategory,
        description: uploadDescription.trim(),
        fileUrl: url,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      const res = await fetchWithAuth("/api/maps/drawings", {
        method: "POST",
        body: JSON.stringify(drawing),
      });

      if (res.ok) {
        toast.success("Drawing uploaded successfully");
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadDescription("");
        setUploadCategory("");
        fetchDrawings();
      } else {
        toast.error("Failed to save drawing record");
      }
    } catch (err) {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDrawing = async (id) => {
    if (!confirm("Delete this drawing?")) return;
    try {
      const res = await fetchWithAuth(`/api/maps/drawings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Drawing deleted");
        fetchDrawings();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getDrawingsByCategory = (catId) => drawings.filter(d => d.category === catId);

  // Image viewer helpers
  const openViewer = (drawing) => {
    setViewerImage(drawing);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerImage(null);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const isImageFile = (drawing) => {
    const ext = (drawing.fileName || "").toLowerCase();
    return /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(ext);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="MEP Location Maps"
          subtitle="Mechanical, Electrical & Plumbing systems overview and design drawings"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Maps" }]}
          actions={<Button icon={<Upload size={16} />} onClick={() => setShowUploadModal(true)}>Upload Drawing</Button>}
        />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button onClick={() => setActiveTab("systems")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "systems" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>MEP Systems</button>
          <button onClick={() => setActiveTab("drawings")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "drawings" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>Design Drawings ({drawings.length})</button>
        </div>

        {activeTab === "drawings" && (
          <div className="space-y-6">
            {DRAWING_CATEGORIES.map((cat) => {
              const catDrawings = getDrawingsByCategory(cat.id);
              return (
                <div key={cat.id} className={`bg-white rounded-md border p-5 ${cat.color.split(" ")[1]}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`p-2 rounded-md ${cat.color.split(" ")[0]} ${cat.color.split(" ")[2]}`}>
                      <cat.icon size={20} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cat.title}</h3>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                    <span className="ml-auto text-sm text-gray-400">{catDrawings.length} file{catDrawings.length !== 1 ? "s" : ""}</span>
                  </div>
                  {catDrawings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {catDrawings.map((d) => (
                        <div key={d._id} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                          {/* Thumbnail */}
                          <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                            {isImageFile(d) ? (
                              <img
                                src={d.fileUrl}
                                alt={d.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <FileText size={32} />
                                <span className="text-xs mt-1 uppercase">{(d.fileName || "").split(".").pop()}</span>
                              </div>
                            )}
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => isImageFile(d) ? openViewer(d) : window.open(d.fileUrl, "_blank")}
                                className="p-2 bg-white rounded-full shadow hover:bg-blue-50 transition"
                                title="View"
                              >
                                <Eye size={16} className="text-blue-600" />
                              </button>
                              <a
                                href={d.fileUrl}
                                download={d.fileName}
                                className="p-2 bg-white rounded-full shadow hover:bg-green-50 transition"
                                title="Download"
                              >
                                <Download size={16} className="text-green-600" />
                              </a>
                              <button
                                onClick={() => handleDeleteDrawing(d._id)}
                                className="p-2 bg-white rounded-full shadow hover:bg-red-50 transition"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-3">
                            <p className="text-sm font-medium text-gray-800 truncate">{d.title}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{d.fileName}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No drawings uploaded for this category yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "systems" && (
          <>
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
          </>
        )}

        {/* Upload Drawing Modal */}
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Design Drawing" size="lg"
          footer={null}
        >
          <div className="space-y-4">
            <FormField label="Drawing Category" required>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                <option value="">Select category...</option>
                {DRAWING_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Drawing Title" required>
              <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g., Ground Floor HVAC Layout" />
            </FormField>
            <FormField label="Description">
              <Textarea rows={2} value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Brief description of the drawing" />
            </FormField>
            <div>
              <label className={`inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 text-sm ${uploading ? 'opacity-50 pointer-events-none' : 'border-gray-300 text-gray-500'}`}>
                <Upload size={18} />
                {uploading ? "Uploading..." : "Select & Upload File (PDF, DWG, Image)"}
                <input type="file" className="hidden" disabled={uploading} accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.svg"
                  onChange={handleUploadDrawing} />
              </label>
              <p className="text-xs text-gray-400 mt-2">Supported: PDF, DWG, DXF, PNG, JPG, SVG</p>
            </div>
          </div>
        </Modal>

        {/* Image Viewer Modal */}
        {viewerOpen && viewerImage && (
          <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
              <div className="text-white min-w-0">
                <p className="text-sm font-medium truncate">{viewerImage.title}</p>
                <p className="text-xs text-gray-300 truncate">{viewerImage.fileName}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleZoomOut} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition" title="Zoom Out">
                  <ZoomOut size={18} />
                </button>
                <span className="text-xs text-white/70 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition" title="Zoom In">
                  <ZoomIn size={18} />
                </button>
                <div className="w-px h-5 bg-white/20 mx-1" />
                <button onClick={handleRotate} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition" title="Rotate">
                  <RotateCw size={18} />
                </button>
                <button onClick={handleReset} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition" title="Reset View">
                  <Maximize2 size={18} />
                </button>
                <div className="w-px h-5 bg-white/20 mx-1" />
                <a href={viewerImage.fileUrl} download={viewerImage.fileName} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition" title="Download">
                  <Download size={18} />
                </a>
                <button onClick={closeViewer} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition ml-2" title="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Image container */}
            <div
              ref={viewerRef}
              className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={viewerImage.fileUrl}
                  alt={viewerImage.title}
                  draggable={false}
                  className="max-w-none transition-transform duration-100"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            </div>

            {/* Bottom hint */}
            <div className="px-4 py-2 bg-black/60 text-center">
              <p className="text-xs text-gray-400">Scroll to zoom • Drag to pan • Click toolbar buttons for controls</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
