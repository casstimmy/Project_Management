
import Layout from "../Layout";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function PageLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout>
      <div className="flex h-full w-full bg-gray-50">
        {/* Fixed Sidebar */}
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} className="fixed" />

        {/* Main content with padding-left to offset fixed sidebar */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? "pl-72" : "pl-0"}`}>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </Layout>
  );
}
