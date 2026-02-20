// components/ManageTeam.js
import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Search, User } from "lucide-react";
import Layout from "@/components/MainLayout/Layout";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";

export default function ManageTeam() {
  const [team, setTeam] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchTeam(); }, []);

  async function fetchTeam() {
    setLoading(true);
    try { const res = await axios.get("/api/manage/team"); setTeam(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filteredTeam = team.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">👥 Manage Team</h1>
          <Link href="/manage/team/new">
            <div className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 cursor-pointer">
              <Plus size={18}/> Add Member
            </div>
          </Link>
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm"/>
        </div>

        {loading ? <Loader/> :
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeam.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No team members found.</p>}
            {filteredTeam.map(member => (
              <div key={member._id} className="bg-white shadow-lg rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {member.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={32}/></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-blue-600 font-medium">{member.role}</p>
                <span className="mt-1 text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full">{member.type}</span>

                <div className="flex gap-4 mt-5">
                  <button onClick={()=>router.push(`/manage/team/edit/${member._id}`)} className="p-2 rounded-full bg-gray-100 text-blue-600"><Edit2 size={18}/></button>
                  <button onClick={()=>router.push(`/manage/team/delete/${member._id}`)} className="p-2 rounded-full bg-gray-100 text-red-600"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </Layout>
  );
}
