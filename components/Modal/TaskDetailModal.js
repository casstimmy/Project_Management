import { useState, useEffect } from "react";
import { X, User, Calendar, MessageSquare, Loader2, Send } from "lucide-react";

export default function TaskDetailModal({ task, onClose, onSave }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  if (!task) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetch("/api/manage/team")
      .then((r) => r.json())
      .then((data) => {
        const members = Array.isArray(data) ? data : [];
        setTeamMembers(members);
        // Pre-select current assignee if they exist
        if (task.assignee?.name) {
          const match = members.find((m) => m.name === task.assignee.name);
          if (match) setAssigneeId(match._id);
        }
      })
      .catch(() => setTeamMembers([]))
      .finally(() => setLoadingTeam(false));
  }, [task.assignee?.name]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [
        ...comments,
        { user: { name: "You", email: "me@example.com" }, message: newComment },
      ];
      setComments(updatedComments);
      setNewComment("");
      if (onSave) {
        onSave(task._id, { comments: updatedComments });
      }
    }
  };

  const handleSaveDetails = () => {
    if (onSave) {
      const member = teamMembers.find((m) => m._id === assigneeId);
      onSave(task._id, {
        assignee: member ? { name: member.name, email: member.email || "" } : null,
        dueDate: dueDate || null,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{task.name}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
              task.status === "done" ? "bg-emerald-50 text-emerald-600" :
              task.status === "inprogress" ? "bg-blue-50 text-blue-600" :
              "bg-gray-100 text-gray-600"
            }`}>
              {task.status}
            </span>
          </div>
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Assignee */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <User size={14} className="text-gray-400" /> Assignee
            </label>
            {loadingTeam ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 size={14} className="animate-spin" /> Loading team…
              </div>
            ) : (
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} — {m.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Calendar size={14} className="text-gray-400" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            onClick={handleSaveDetails}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            Save Changes
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="flex items-center gap-1.5 font-medium text-gray-900 text-sm mb-3">
              <MessageSquare size={14} className="text-gray-400" /> Comments
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No comments yet</p>
              )}
              {comments.map((c, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700">{c.user?.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{c.message}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
