import Layout from "../Layout";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function PageLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout>
      <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}>
        <main className="mt-14 ">{children}</main>
      </div>
    </div>
    </Layout>
  );
}
