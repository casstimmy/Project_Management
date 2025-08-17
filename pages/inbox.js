// pages/inbox.js
import { useEffect, useState } from "react";
import Layout from "@/components/MainLayout/Layout";
import Link from "next/link";
import { CheckCircle, MailOpen } from "lucide-react";

export default function InboxPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock fetch function – replace with your real API later
  const fetchNotifications = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));

    const mock = [
      {
        id: "notif1",
        taskId: "task123",
        projectId: "proj1",
        title: "New comment on task 'Design Landing Page'",
        type: "comment",
        read: false,
        time: "Just now",
      },
      {
        id: "notif2",
        taskId: "task567",
        projectId: "proj2",
        title: "You were assigned to task 'Write Documentation'",
        type: "assignment",
        read: false,
        time: "10 mins ago",
      },
      {
        id: "notif3",
        taskId: "task789",
        projectId: "proj3",
        title: "Task 'Review Feedback' marked as completed",
        type: "status-change",
        read: true,
        time: "Yesterday",
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
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Inbox</h1>

        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-600">No new notifications.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`border rounded-lg px-4 py-3 flex justify-between items-start ${
                  notif.read ? "bg-gray-100" : "bg-white"
                }`}
              >
                <div>
                  <p className="font-medium text-sm mb-1">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.time}</p>
                  <Link
                    href={`/projects/${notif.projectId}`}
                    className="text-indigo-600 text-sm hover:underline mt-1 inline-block"
                  >
                    View Project
                  </Link>
                </div>

                <button
                  onClick={() => markAsRead(notif.id)}
                  className="text-sm flex items-center gap-1 text-gray-500 hover:text-indigo-600"
                  disabled={notif.read}
                >
                  {notif.read ? (
                    <>
                      <MailOpen size={16} /> Read
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Mark as Read
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
