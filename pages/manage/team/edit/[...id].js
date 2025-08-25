import Layout from "@/components/MainLayout/Layout";
import TeamForm from "@/components/TeamForm";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditTeamMember(){
    const [Member, setMember] = useState(null);
    const router = useRouter();
    const {id} = router.query;

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/api/manage/team?id='+id).then(res => {
            setMember(res.data);
        });
    }, [id]);
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Edit Team Member</h2>
        <TeamForm {...Member} />
      </div>
    </Layout>
  );
}
