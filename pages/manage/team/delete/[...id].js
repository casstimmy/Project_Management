import Layout from "@/components/MainLayout/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DeleteTeamMemberPage() {
  const router = useRouter();
  const [memberInfo, setMemberInfo] = useState();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    axios.get("/api/manage-team?id=" + id).then((res) => {
      setMemberInfo(res.data);
    });
  }, [id]);

  function goBack() {
    router.push("/manage/team");
  }

  async function handleDelete() {
    try {
      await axios.delete(`/api/manage-team?id=${id}`);
      goBack();
    } catch (error) {
      console.error("Failed to delete team member:", error);
      alert("Failed to delete team member. Please try again.");
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Confirm Deletion
          </h1>
          <p className="text-gray-600 mb-8">
            Are you sure you want to delete{" "}
            <strong>{memberInfo?.name}</strong> from your team?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDelete}
              className="py-2 px-6 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition duration-300"
            >
              Yes, Delete
            </button>
            <button
              onClick={goBack}
              className="py-2 px-6 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition duration-300"
            >
              No, Cancel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
