// pages/manage/team/index.js
import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Search, User, Users } from "lucide-react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ManageTeam() {
  const [team, setTeam] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchTeam(); }, []);

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await fetch("/api/manage/team");
      const data = await res.json();
      setTeam(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filteredTeam = team.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Manage Team"
          subtitle="View and manage team members"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Team" }]}
          actions={
            <Link href="/manage/team/new">
              <Button icon={<Plus size={16} />}>Add Member</Button>
            </Link>
          }
        />

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search team members..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <Loader text="Loading team..." /> :
          filteredTeam.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No team members found</p>
              <p className="text-sm">Add your first team member to get started</p>
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeam.map(member => (
              <div key={member._id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center hover:shadow-sm transition">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-3">
                  {member.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={28}/></div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{member.role}</p>
                <span className="mt-1.5 text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{member.type}</span>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 w-full justify-center">
                  <button onClick={() => router.push(`/manage/team/edit/${member._id}`)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                    <Edit2 size={16}/>
                  </button>
                  <button onClick={() => router.push(`/manage/team/delete/${member._id}`)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )
        }
      </div>
    </Layout>
  );
}
