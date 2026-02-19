import { useState } from "react";
import {
  Search, Filter, Plus, Download, Upload, ChevronDown,
  ChevronLeft, ChevronRight,
} from "lucide-react";

/**
 * Professional page header with title, breadcrumbs, and actions
 */
export function PageHeader({ title, subtitle, breadcrumbs = [], actions, children }) {
  return (
    <div className="mb-6">
      {breadcrumbs.length > 0 && (
        <nav className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-blue-600 transition">{crumb.label}</a>
              ) : (
                <span className="text-gray-800 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * Stat card for dashboard metrics
 */
export function StatCard({ icon, label, value, trend, trendUp, color = "blue", subtext, onClick }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    yellow: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
    gray: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border ${c.border} p-5 hover:shadow-md transition-all duration-200 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`${c.bg} ${c.text} p-2.5 rounded-lg`}>{icon}</div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {trendUp ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

/**
 * Data table with search, filter, and pagination
 */
export function DataTable({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue,
  totalItems,
  page = 1,
  onPageChange,
  pageSize = 20,
  loading = false,
  emptyMessage = "No data found",
  actions,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col, i) => (
                <th key={i} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > pageSize && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-gray-700 font-medium">{page}</span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page * pageSize >= totalItems}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Status badge component
 */
export function StatusBadge({ status, size = "sm" }) {
  const map = {
    // General
    active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
    inactive: { bg: "bg-gray-100", text: "text-gray-600", label: "Inactive" },
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Completed" },
    approved: { bg: "bg-blue-50", text: "text-blue-700", label: "Approved" },

    // Asset
    "in-service": { bg: "bg-emerald-50", text: "text-emerald-700", label: "In Service" },
    "out-of-service": { bg: "bg-red-50", text: "text-red-700", label: "Out of Service" },
    disposed: { bg: "bg-gray-100", text: "text-gray-600", label: "Disposed" },

    // Work Order
    open: { bg: "bg-blue-50", text: "text-blue-700", label: "Open" },
    assigned: { bg: "bg-purple-50", text: "text-purple-700", label: "Assigned" },
    "in-progress": { bg: "bg-amber-50", text: "text-amber-700", label: "In Progress" },
    "on-hold": { bg: "bg-gray-100", text: "text-gray-600", label: "On Hold" },
    closed: { bg: "bg-gray-200", text: "text-gray-700", label: "Closed" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Cancelled" },

    // Incident
    reported: { bg: "bg-amber-50", text: "text-amber-700", label: "Reported" },
    investigating: { bg: "bg-blue-50", text: "text-blue-700", label: "Investigating" },
    resolved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Resolved" },

    // Maintenance
    paused: { bg: "bg-amber-50", text: "text-amber-700", label: "Paused" },

    // Budget
    submitted: { bg: "bg-blue-50", text: "text-blue-700", label: "Submitted" },
    rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },

    // Site
    operational: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Operational" },
    "under-construction": { bg: "bg-amber-50", text: "text-amber-700", label: "Under Construction" },
    "under-maintenance": { bg: "bg-amber-50", text: "text-amber-700", label: "Under Maintenance" },
    decommissioned: { bg: "bg-gray-200", text: "text-gray-600", label: "Decommissioned" },
  };

  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status };
  const sizeClass = size === "xs" ? "text-xs px-1.5 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`${s.bg} ${s.text} ${sizeClass} rounded-full font-medium capitalize inline-block`}>
      {s.label}
    </span>
  );
}

/**
 * Priority badge
 */
export function PriorityBadge({ priority }) {
  const map = {
    low: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
    critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    urgent: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };
  const p = map[priority] || map.medium;

  return (
    <span className={`${p.bg} ${p.text} text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {priority}
    </span>
  );
}

/**
 * Professional button component
 */
export function Button({ children, variant = "primary", size = "md", icon, onClick, disabled, className = "", type = "button" }) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * Form input
 */
export function FormField({ label, required, error, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Input component
 */
export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400 ${className}`}
      {...props}
    />
  );
}

/**
 * Select component
 */
export function Select({ options, placeholder, className = "", ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Textarea component
 */
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none placeholder:text-gray-400 ${className}`}
      {...props}
    />
  );
}

/**
 * Modal component
 */
export function Modal({ isOpen, onClose, title, children, size = "md", footer }) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tab component
 */
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-0 -mb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/**
 * Empty state
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
