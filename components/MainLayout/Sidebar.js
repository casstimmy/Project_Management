import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Building2, Package, ClipboardCheck,
  ShieldCheck, AlertTriangle, Wrench, CalendarClock,
  DollarSign, FileText, Users, ChevronDown,
  ChevronRight, MapPin, Layers, Bell, Gauge,
  FolderKanban, Settings,
} from "lucide-react";

const navSections = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/homePage", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "FACILITY MANAGEMENT",
    items: [
      {
        label: "Locations",
        icon: MapPin,
        children: [
          { href: "/locations/sites", label: "Sites" },
          { href: "/locations/buildings", label: "Buildings" },
          { href: "/locations/spaces", label: "Spaces" },
        ],
      },
      { href: "/assets", label: "Asset Register", icon: Package },
      { href: "/fca", label: "Condition Assessment", icon: ClipboardCheck },
    ],
  },
  {
    title: "SAFETY & COMPLIANCE",
    items: [
      { href: "/hsse", label: "HSSE Audit", icon: ShieldCheck },
      { href: "/incidents", label: "Incidents", icon: AlertTriangle },
      { href: "/emergency", label: "Emergency Plans", icon: Bell },
    ],
  },
  {
    title: "MAINTENANCE",
    items: [
      { href: "/maintenance", label: "Maintenance Plans", icon: CalendarClock },
      { href: "/workorders", label: "Work Orders", icon: Wrench },
    ],
  },
  {
    title: "PROJECT MANAGEMENT",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { href: "/budgets", label: "Budgets & Finance", icon: DollarSign },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { href: "/manage/team", label: "Team Management", icon: Users },
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
];

export default function Sidebar({ user }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  const toggleExpand = (label) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href) => router.pathname === href || router.asPath === href;
  const isChildActive = (children) => children?.some((c) => isActive(c.href));

  return (
    <aside
      className={`${collapsed ? "w-[68px]" : "w-64"} bg-white border-r border-gray-200 h-[calc(100vh-3.5rem)] flex flex-col transition-all duration-200`}
    >
      {/* Collapse toggle */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-end"} px-3 pt-3`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <Layers size={16} />
        </button>
      </div>

      {/* Navigation - fixed, no scroll */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-hidden">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                // Items with children (expandable)
                if (item.children) {
                  const childActive = isChildActive(item.children);
                  const isExpanded = expanded[item.label] || childActive;

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition group ${
                          childActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <item.icon size={18} className={childActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left font-medium">{item.label}</span>
                            {isExpanded ? (
                              <ChevronDown size={14} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={14} className="text-gray-400" />
                            )}
                          </>
                        )}
                      </button>
                      {isExpanded && !collapsed && (
                        <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-2.5 py-1.5 text-sm rounded-md transition ${
                                isActive(child.href)
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Simple nav item
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition group ${
                      active
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={active ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer with Settings */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-2">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition group ${
            isActive("/admin/settings")
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings
            size={18}
            className={isActive("/admin/settings") ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}
          />
          {!collapsed && <span>Settings</span>}
        </Link>
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs text-gray-400 px-2.5">
            <Gauge size={14} />
            <span>OPAL shire v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
