import {
  FaBell,
  FaUserCircle,
  FaHome,
  FaProjectDiagram,
  FaChartPie,
  FaCogs,
  FaWrench,
  FaTools,
  FaTasks,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";







const navStructure = [
  {
    label: "Dashboard",
    href: "/",
    icon: <FaHome />,
  },
  {
    label: "User Management",
    icon: <FaUserCircle />,
    children: [
      { label: "Login & Registration", href: "/user/login" },
      { label: "Role-based Permissions", href: "/user/roles" },
      { label: "Audit Logs", href: "/user/audit-logs" },
      { label: "Single Sign-On", href: "/user/sso" },
    ],
  },
  {
    label: "Project Management",
    icon: <FaProjectDiagram />,
    children: [
      { label: "Projects", href: "/projects" },
      { label: "Charter Templates", href: "/projects/templates" },
      { label: "Tasks & Subtasks", href: "/projects/tasks" },
      { label: "Gantt Chart", href: "/projects/gantt" },
      { label: "Kanban Board", href: "/projects/kanban" },
      { label: "Milestones & Calendar", href: "/projects/milestones" },
      { label: "Alerts & Reminders", href: "/projects/alerts" },
      { label: "Portfolio Dashboards", href: "/projects/portfolio" },
    ],
  },
  {
    label: "Budgeting & Contracts",
    icon: <FaChartPie />,
    children: [
      { label: "Estimation & Tracking", href: "/budgets/estimation" },
      { label: "Version Comparisons", href: "/budgets/versions" },
      { label: "Approval Workflow", href: "/budgets/approval" },
      { label: "Contract Templates", href: "/contracts/templates" },
      { label: "E-signature Integration", href: "/contracts/esignature" },
    ],
  },
  {
    label: "Maintenance Planning",
    icon: <FaWrench />,
    children: [
      { label: "Preventive Scheduler", href: "/maintenance/preventive" },
      { label: "Issue Reporting", href: "/maintenance/issues" },
      { label: "Work Orders", href: "/maintenance/work-orders" },
      { label: "Recurring Tasks", href: "/maintenance/recurring" },
      { label: "Mobile Offline Mode", href: "/maintenance/mobile" },
    ],
  },
  {
    label: "Asset Management",
    icon: <FaTools />,
    children: [
      { label: "Asset Registry", href: "/assets/registry" },
      { label: "Condition Tracking", href: "/assets/condition" },
      { label: "Lifecycle Cost", href: "/assets/lifecycle" },
      { label: "Barcode/QR Tagging", href: "/assets/barcode" },
      { label: "IoT Integration", href: "/assets/iot" },
    ],
  },
  {
    label: "Data & Reporting",
    icon: <FaTasks />,
    children: [
      { label: "Inspection Forms", href: "/reports/forms" },
      { label: "File Attachments", href: "/reports/files" },
      { label: "Export Reports", href: "/reports/export" },
      { label: "Dashboards (KPIs)", href: "/reports/kpi" },
      { label: "Predictive Analytics", href: "/reports/ai" },
    ],
  },
  {
    label: "Integrations & Notifications",
    icon: <FaBell />,
    children: [
      { label: "Email & In-app", href: "/notifications/email" },
      { label: "Push Notifications", href: "/notifications/push" },
      { label: "Calendar Sync", href: "/integrations/calendar" },
      { label: "Accounting Integration", href: "/integrations/accounting" },
    ],
  },
  {
    label: "Admin & Settings",
    icon: <FaCogs />,
    children: [
      { label: "Template Management", href: "/admin/templates" },
      { label: "Backup & Restore", href: "/admin/backup" },
      { label: "Languages & Currency", href: "/admin/localization" },
    ],
  },
];






export default function Nav({ children }) {
  const router = useRouter();
  const [activeParent, setActiveParent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);



  useEffect(() => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
 const decoded = jwtDecode(token);
  console.log("Decoded Token:", decoded);

        setUser(decoded);
      } catch (err) {
        console.error("Token decode error:", err);
        setUser(null);
      }
    }
  }
 

}, []);


  const handleNavClick = (item) => {
    if (item.children) {
      setActiveParent(item.label === activeParent ? null : item.label);
    } else {
      router.push(item.href);
      setActiveParent(null);
      setMobileOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[#ffffff] text-gray-800 font-[Inter,sans-serif]">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        {/* Main Nav */}
        <div className="w-60 bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200 overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={50}
                height={50}
                
              />
              <h1 className="text-3xl font-black text-blue-700 leading-tight tracking-tight ml-1">pal</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1 tracking-wide uppercase">Project Manager</p>
          </div>
          <nav className="p-4 text-sm font-medium space-y-3">
            {navStructure.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`flex items-center w-full px-4 py-2.5 rounded-xl text-left transition-all duration-300 group cursor-pointer ${
                 item.children?.some((child) => router.pathname.startsWith(child.href)) ||
router.pathname === item.href ||
activeParent === item.label

                    ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold ring-1 ring-blue-100"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <span className="text-lg mr-3 group-hover:scale-110 group-hover:text-blue-600 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="text-[15px]">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sub Nav */}
        <div className={`transition-all duration-300 bg-gradient-to-b from-blue-50 to-white border-r border-gray-100 shadow-inner pt-6 overflow-hidden text-sm font-medium cursor-pointer ${activeParent ? "w-64" : "w-0"}`}>
          {activeParent && (
            <>
              <p className="text-xs uppercase text-blue-500 mb-3 tracking-wide">{activeParent}</p>
              <ul className="space-y-2">
                {navStructure.find((item) => item.label === activeParent)?.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                     className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
  router.pathname === child.href
                          ? "bg-white text-blue-700 font-semibold ring-1 ring-inset ring-blue-100"
                          : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                      }`}
                      onClick={() => setMobileOpen(false)} // Close on mobile
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
     {mobileOpen && (
  <div
    className="fixed inset-0 backdrop-blur-sm z-30 md:hidden"
    onClick={() => setMobileOpen(false)}
  />
)}


      {/* Main Content */}
      <div className="flex-1 md:ml-[15rem] flex flex-col">
        {/* Top Bar */}
      <header className="flex items-center justify-between bg-white h-16 px-6 border-b border-gray-200 shadow sticky top-0 z-10">
  {/* Mobile Toggle */}
  <div className="md:hidden mr-4">
    <button onClick={() => setMobileOpen(!mobileOpen)}>
      {mobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
    </button>
  </div>

  {/* Search */}
  <div className="flex-1 max-w-sm">
    <input
      type="text"
      placeholder="Search..."
      className="w-full px-4 py-2.5 text-sm border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
    />
  </div>

  {/* Right Icons */}
  <div className="flex items-center gap-6">
    <FaBell className="text-xl text-gray-500 cursor-pointer hover:text-blue-600 transition" />
    <div className="flex items-center gap-2">
  <FaUserCircle className="text-2xl text-blue-600" />
  <div className="flex flex-col text-sm leading-tight">
    <span className="font-semibold">
      {user?.name || "Unknown User"}
    </span>
    <span className="text-gray-500 text-xs">
      {user?.email || "No Email"}
    </span>
  </div>
</div>

    <button
      onClick={() => {
        localStorage.removeItem("token");
        router.push("/");
      }}
      className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition"
    >
      Logout
    </button>
  </div>
</header>


        {/* Page Content */}
  <main className="flex-1 p-6 overflow-auto bg-[#f9fafb]">
    {children}
  </main>
      </div>
    </div>
  );
}
