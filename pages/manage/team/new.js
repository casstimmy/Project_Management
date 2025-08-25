import Layout from "@/components/MainLayout/Layout";
import TeamForm from "@/components/TeamForm";

export default function NewTeamMember() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Add Team Member</h2>
        <TeamForm />
      </div>
    </Layout>
  );
}
