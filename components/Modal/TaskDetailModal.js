import { useState } from "react";
import { X } from "lucide-react";

export default function TaskDetailModal({ task, onClose, onSave }) {
 if (!task) return null;  // ⬅️ guard against undefined task

  const [comments, setComments] = useState(task.comments || []);
  const [newComment, setNewComment] = useState("");
  const [assignee, setAssignee] = useState(task.assignee?.name || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );


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
      onSave(task._id, {
        assignee: assignee ? { name: assignee, email: "" } : null,
        dueDate: dueDate || null,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">{task.name}</h2>

        {/* Assignee */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Assignee:</label>
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Due Date */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        <button
          onClick={handleSaveDetails}
          className="mb-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700"
        >
          Save Changes
        </button>

        {/* Comments */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">Comments</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {comments.map((c, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded">
                <p className="text-xs font-semibold">{c.user?.name}</p>
                <p>{c.message}</p>
              </div>
            ))}
          </div>

          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border border-gray-300 rounded-md p-2"
          />
          <button
            onClick={handleAddComment}
            className="mt-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}
