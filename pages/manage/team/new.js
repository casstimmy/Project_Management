import Layout from "@/components/MainLayout/Layout";
import TeamForm from "@/components/TeamForm";


export default function Products() {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 w-full">
            <h2 className="text-xl font-semibold">Add a Team Member</h2>
          </div>
          <TeamForm />
    </Layout>
  );
}
