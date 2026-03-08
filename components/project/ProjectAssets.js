import { useState, useEffect } from "react";
import { Package, Plus, X, ImageIcon, MapPin } from "lucide-react";
import { Button, Modal, FormField } from "@/components/ui/SharedComponents";
import toast from "react-hot-toast";

export default function ProjectAssets({ project, onRefresh }) {
  const [allAssets, setAllAssets] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [showImageModal, setShowImageModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const assets = project?.assets || [];

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((d) => {
        const list = d.assets || (Array.isArray(d) ? d : []);
        setAllAssets(list);
      })
      .catch(() => {});
  }, []);

  const linkedIds = new Set(assets.map((a) => a._id));
  const availableAssets = allAssets.filter((a) => !linkedIds.has(a._id));

  const getAssetLocation = (asset) => {
    const parts = [];
    if (asset.site?.name) parts.push(asset.site.name);
    if (asset.building?.name) parts.push(asset.building.name);
    return parts.length > 0 ? parts.join(" > ") : "No location";
  };

  const handleLink = async () => {
    if (!selectedAssetId) return toast.error("Select an asset");
    try {
      setSaving(true);
      const res = await fetch(`/api/projects/${project._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: [...assets.map((a) => a._id), selectedAssetId],
        }),
      });
      if (res.ok) {
        toast.success("Asset linked to project");
        setShowLinkModal(false);
        setSelectedAssetId("");
        onRefresh?.();
      }
    } catch {
      toast.error("Failed to link asset");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (assetId) => {
    if (!confirm("Remove this asset from the project?")) return;
    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: assets.filter((a) => a._id !== assetId).map((a) => a._id),
        }),
      });
      if (res.ok) {
        toast.success("Asset removed");
        onRefresh?.();
      }
    } catch {
      toast.error("Failed to remove asset");
    }
  };

  const statusColor = {
    "in-service": "bg-emerald-50 text-emerald-700",
    "out-of-service": "bg-red-50 text-red-700",
    "pending-installation": "bg-amber-50 text-amber-700",
    disposed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Assets</h3>
          <p className="text-sm text-gray-500">{assets.length} asset{assets.length !== 1 ? "s" : ""} linked</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowLinkModal(true)}>
          Link Asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-1">No assets linked</h4>
          <p className="text-sm text-gray-500 mb-4">Link facility assets to this project for tracking.</p>
          <Button icon={<Plus size={16} />} onClick={() => setShowLinkModal(true)}>
            Link First Asset
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Image</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Asset</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Strategy</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map((asset) => (
                <tr key={asset._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    {asset.imageUrl ? (
                      <button
                        onClick={() => setShowImageModal({ url: asset.imageUrl, name: asset.name })}
                        className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition"
                      >
                        <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={16} className="text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                    <p className="text-xs text-gray-400">{asset.assetTag || "No tag"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} className="text-gray-400" />
                      {getAssetLocation(asset)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[asset.status] || "bg-gray-100"}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                      {asset.maintenanceStrategy || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleUnlink(asset._id)}
                      className="text-gray-400 hover:text-red-500 transition p-1 rounded hover:bg-red-50"
                      title="Remove from project"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Link Asset Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link Asset to Project"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLinkModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleLink} disabled={saving}>
              {saving ? "Linking..." : "Link Asset"}
            </Button>
          </>
        }
      >
        <FormField label="Select Asset">
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
          >
            <option value="">Choose an asset to link...</option>
            {availableAssets.map((a) => {
              const loc = [a.site?.name, a.building?.name].filter(Boolean).join(" > ");
              return (
                <option key={a._id} value={a._id}>
                  {a.name} — {a.assetTag || "No tag"}{loc ? ` — ${loc}` : ""} ({a.category})
                </option>
              );
            })}
          </select>
        </FormField>
        {availableAssets.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">All assets are already linked or no assets exist.</p>
        )}
      </Modal>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 z-10"
            >
              <X size={16} className="text-gray-600" />
            </button>
            <img
              src={showImageModal.url}
              alt={showImageModal.name}
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            />
            <p className="text-center text-white text-sm mt-3 font-medium">{showImageModal.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
