import { useState, useEffect } from "react";
import Layout from "@/components/MainLayout/Layout";
import { PageHeader, DataTable, StatusBadge, Button, Modal, FormField, Input, Select } from "@/components/ui/SharedComponents";
import { Layers, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/buildings").then(r => r.json()).then(d => setBuildings(Array.isArray(d) ? d : []));
  }, []);

  // Spaces use FacilitySpace model - for now show a placeholder
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Spaces"
          subtitle="Manage rooms and spaces within buildings"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Locations" }, { label: "Spaces" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Add Space</Button>}
        />
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Layers size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Space Management</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Manage individual rooms, floors, and spaces within your buildings. Assign assets to specific locations for precise tracking.
          </p>
          <Button className="mt-4" icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Add First Space</Button>
        </div>
      </div>
    </Layout>
  );
}
