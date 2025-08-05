
import PageLayout from "@/components/layout/PageLayout";
import { Plus, List, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-white p-4 space-y-6 md:p-10">
      {/* Top Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Welcome back, Ayo!</h1>
        <p className="text-gray-600 text-sm md:text-base">Here's what's happening with your teams today.</p>
      </div>

      {/* Spaces Section */}
      <div className="bg-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Spaces</h2>
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <Plus size={16} /> New Space
          </button>
        </div>

        <div className="space-y-4">
          {/* Team Space Card */}
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <Users size={18} className="text-blue-600" />
              <span className="font-medium">Team Space</span>
            </div>
            <div className="ml-6 mt-2 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                <List size={14} /> List
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                <List size={14} /> Hetch
              </Link>
            </div>
          </div>

          {/* Add more space cards here if needed */}
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
