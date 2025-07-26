import { FaClipboardList } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

export default function Estimation() {
  return (
   <Layout>
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
  <div className="text-center max-w-lg mx-auto p-6 bg-white border rounded-2xl shadow-xl">
  <FaClipboardList className="text-blue-600 text-6xl mb-4" />
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
        Estimation Logs Coming Soon
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        We’re building a detailed, secure logging system to track key actions and changes
        across your organization. This page will house full audit history for transparency and accountability.
      </p>
      <div className="flex items-center gap-2 text-blue-600 animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Initializing logging framework...</span>
      </div>
    </div>
      </div>
   </Layout>
  );
}
