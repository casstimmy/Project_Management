import Layout from "@/components/Layout";
import { FileText, FilePlus2, ShieldCheck, Download, Eye } from "lucide-react";

export default function CharterTemplates() {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-100 to-white py-6 px-4 md:px-10 flex items-center justify-center">
       <div className="flex flex-col items-center max-w-4xl w-full">
          <div className="
                  mx-auto w-full">
                 
         
          <div className="mb-10">
           <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Charter Templates System
            </h1>
            <p className="text-gray-600 text-lg">
              Streamline your project initiation process with smart, reusable templates tailored to your organization’s workflow.
            </p>
          </div>
          </div>
        
        <div className="max-w-5xl w-full bg-white border rounded-3xl shadow-xl px-8 md:px-16 py-12">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <FileText className="w-14 h-14 text-blue-600" />
            </div>
           
           
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-2">✨ Key Features:</h2>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>📄 Predefined and fully customizable templates</li>
                <li>📌 Clearly define project objectives, scope, and stakeholders</li>
                <li>📂 Organized template storage for easy access</li>
                <li>🔄 Version control with approval workflow</li>
                <li>👥 Role-based permissions to ensure security</li>
                <li>📤 Export to PDF or share with team via secure links</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-2">🔒 Compliance & Access Control:</h2>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>🔐 Secure access based on team roles</li>
                <li>✅ Audit logs to track every change made</li>
                <li>🕵️ Review historical versions easily</li>
                <li>🔗 Seamless integration into project kickoff routines</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 mb-2 text-sm">Coming Soon to Your Dashboard</p>
              <h3 className="text-lg font-medium text-gray-800">
                Be ready to initiate projects faster and smarter!
              </h3>
            </div>
            <div className="flex gap-4">
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition">
                <FilePlus2 className="w-4 h-4" />
                Create Template
              </button>
              <button className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-lg transition">
                <Eye className="w-4 h-4" />
                View Sample
              </button>
              <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-5 py-2 rounded-lg transition">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
       </div>
              
               
      </div>
    </Layout>
  );
}
