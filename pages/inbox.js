// pages/inbox.js
import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import Link from "next/link";
import { CheckCircle, MailOpen, Bell, Inbox, Trash2, Filter } from "lucide-react";
import fetchWithAuth from "@/lib/fetchWithAuth";

export default function InboxPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/notifications?limit=100${unreadOnly ? "&unreadOnly=true" : ""}`);
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(data.unreadCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await fetchWithAuth("/api/notifications", {
      method: "PUT",
      body: JSON.stringify({ notificationId: id }),
    });
    await fetchNotifications();
  };

  const markAllRead = async () => {
    await fetchWithAuth("/api/notifications", {
      method: "PUT",
      body: JSON.stringify({ markAll: true }),
    });
    await fetchNotifications();
  };

  const clearRead = async () => {
    await fetchWithAuth("/api/notifications", {
      method: "DELETE",
      body: JSON.stringify({ clearRead: true }),
    });
    await fetchNotifications();
  };

  const typeIcon = (type) => {
    const colors = {
      "asset-alert": "bg-blue-50 text-blue-600",
      "maintenance-due": "bg-amber-50 text-amber-700",
      "work-order": "bg-indigo-50 text-indigo-700",
      incident: "bg-red-50 text-red-700",
      "audit-reminder": "bg-teal-50 text-teal-700",
      "budget-alert": "bg-emerald-50 text-emerald-700",
      emergency: "bg-red-50 text-red-700",
      system: "bg-violet-50 text-violet-700",
      general: "bg-gray-50 text-gray-600",
    };
    return colors[type] || "bg-gray-50 text-gray-600";
  };

  const formatWhen = (isoDate) => {
    if (!isoDate) return "Now";
    const ms = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hrs ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} days ago`;
    return new Date(isoDate).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Inbox"
          subtitle="Notifications and updates across assets, maintenance, incidents, budgets and tasks"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Inbox" }]}
          actions={(
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnreadOnly((s) => !s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border ${unreadOnly ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-600"}`}
              >
                <Filter size={14} /> {unreadOnly ? "Unread only" : "All"}
              </button>
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCircle size={14} className="mr-1" /> Mark all read
              </Button>
              <Button variant="outline" size="sm" onClick={clearRead}>
                <Trash2 size={14} className="mr-1" /> Clear read
              </Button>
            </div>
          )}
        />

        <div className="mb-4 text-sm text-gray-600">Unread notifications: <span className="font-semibold text-gray-800">{unreadCount}</span></div>

        {loading ? (
          <Loader text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Inbox size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif._id}
                className={`bg-white rounded-md border border-gray-200 px-5 py-4 flex justify-between items-start gap-4 hover:shadow-sm transition ${
                  notif.read ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-md mt-0.5 ${typeIcon(notif.type)}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatWhen(notif.createdAt)}</p>
                    {!!notif.link && (
                      <Link
                        href={notif.link}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => markAsRead(notif._id)}
                  disabled={notif.read}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition ${
                    notif.read
                      ? "text-gray-400 bg-gray-50 cursor-default"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {notif.read ? (
                    <><MailOpen size={14} /> Read</>
                  ) : (
                    <><CheckCircle size={14} /> Mark Read</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
