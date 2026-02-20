// pages/inbox.js
import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Loader from "@/components/Loader";
import { PageHeader } from "@/components/ui/SharedComponents";
import Link from "next/link";
import { CheckCircle, MailOpen, Bell, Inbox } from "lucide-react";

export default function InboxPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const mock = [
      {
        id: "notif1", taskId: "task123", projectId: "proj1",
        title: "New comment on task 'Design Landing Page'",
        type: "comment", read: false, time: "Just now",
      },
      {
        id: "notif2", taskId: "task567", projectId: "proj2",
        title: "You were assigned to task 'Write Documentation'",
        type: "assignment", read: false, time: "10 mins ago",
      },
      {
        id: "notif3", taskId: "task789", projectId: "proj3",
        title: "Task 'Review Feedback' marked as completed",
        type: "status-change", read: true, time: "Yesterday",
      },
    ];

    setNotifications(mock);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const typeIcon = (type) => {
    const colors = {
      comment: "bg-blue-50 text-blue-600",
      assignment: "bg-purple-50 text-purple-600",
      "status-change": "bg-green-50 text-green-600",
    };
    return colors[type] || "bg-gray-50 text-gray-600";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Inbox"
          subtitle="Notifications and updates"
          breadcrumbs={[{ label: "Dashboard", href: "/homePage" }, { label: "Inbox" }]}
        />

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
              <div key={notif.id}
                className={`bg-white rounded-xl border border-gray-200 px-5 py-4 flex justify-between items-start gap-4 hover:shadow-sm transition ${
                  notif.read ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg mt-0.5 ${typeIcon(notif.type)}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    <Link
                      href={`/projects/${notif.projectId}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                    >
                      View Project →
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => markAsRead(notif.id)}
                  disabled={notif.read}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
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
