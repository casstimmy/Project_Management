// pages/projects/index.js
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Layout from "@/components/MainLayout/Layout";
import {
  PageHeader, StatCard, Button, Modal, FormField, Input, Select, Textarea,
} from "@/components/ui/SharedComponents";
import {
  FolderKanban, Plus, Edit, Trash2, Users,
  Calendar, Target, ArrowRight, Search,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", purpose: "", scope: "", site: "",
    risks: "", assumptions: "",
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetch("/api/spaces").then(r => r.json()).then(d => setSpaces(Array.isArray(d) ? d : []));
    fetch("/api/sites").then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : []));
  }, [fetchProjects]);

  const resetForm = () => setForm({
    title: "", purpose: "", scope: "", site: "",
    risks: "", assumptions: "",
  });

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Project title is required");

    let spaceId;
    if (spaces.length > 0) {
      spaceId = spaces[0]._id;
    } else {
      const spaceRes = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Default Workspace" }),
      });
      const newSpace = await spaceRes.json();
      spaceId = newSpace._id;
      setSpaces([newSpace]);
    }

    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/projects/${editing._id}` : "/api/projects";
    const body = editing ? { ...form } : { spaceId, ...form };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editing ? "Project updated" : "Project created");
        setShowModal(false);
        resetForm();
        setEditing(null);
        fetchProjects();
      } else {
        toast.error("Operation failed");
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        fetchProjects();
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "", purpose: p.purpose || "", scope: p.scope || "",
      site: p.site || "", risks: p.risks || "", assumptions: p.assumptions || "",
    });
    setShowModal(true);
  };

  const filtered = projects.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.purpose || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalTasks = projects.reduce((s, p) => s + (p.tasks?.length || 0), 0);
  const totalBudget = projects.reduce((s, p) => {
    return s + (p.budget || []).reduce((bs, b) => bs + (b.amount || 0), 0);
  }, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Projects"
          subtitle="Manage facility projects, tasks, and deliverables"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Projects" }]}
          actions={<Button icon={<Plus size={16} />} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>New Project</Button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FolderKanban size={20} />} label="Total Projects" value={projects.length} color="blue" />
          <StatCard icon={<Target size={20} />} label="Total Tasks" value={totalTasks} color="purple" />
          <StatCard icon={<Users size={20} />} label="Stakeholders" value={projects.reduce((s, p) => s + (p.stakeholders?.length || 0), 0)} color="green" />
          <StatCard icon={<Calendar size={20} />} label="Total Budget" value={`₦${totalBudget.toLocaleString()}`} color="indigo" />
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search projects..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FolderKanban size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const taskCount = p.tasks?.length || 0;
              const budgetTotal = (p.budget || []).reduce((s, b) => s + (b.amount || 0), 0);
              const siteName = sites.find(s => s._id === p.site)?.name;
              return (
                <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-50"><FolderKanban size={18} className="text-blue-600" /></div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} className="text-gray-400" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.purpose || "No description"}</p>
                  {siteName && <p className="text-xs text-gray-400 mb-2">Site: {siteName}</p>}
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{taskCount} tasks</span>
                    {budgetTotal > 0 && <span className="text-xs text-gray-500">₦{budgetTotal.toLocaleString()}</span>}
                    <Link href={`/projects/${p._id}`} className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); resetForm(); }}
          title={editing ? "Edit Project" : "New Project"} size="lg"
          footer={<div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? "Update" : "Create"} Project</Button>
          </div>}>
          <div className="space-y-4">
            <FormField label="Project Title" required>
              <Input placeholder="e.g. HVAC Upgrade Phase 2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </FormField>
            <FormField label="Purpose / Description">
              <Textarea placeholder="What is this project about?" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={3} />
            </FormField>
            <FormField label="Site (optional)">
              <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
                placeholder="— Select Site —"
                options={sites.map((s) => ({ value: s._id, label: s.name }))} />
            </FormField>
            <FormField label="Scope">
              <Textarea placeholder="Define the project scope" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} rows={2} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Risks">
                <Textarea placeholder="Known risks" value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} rows={2} />
              </FormField>
              <FormField label="Assumptions">
                <Textarea placeholder="Key assumptions" value={form.assumptions} onChange={(e) => setForm({ ...form, assumptions: e.target.value })} rows={2} />
              </FormField>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
