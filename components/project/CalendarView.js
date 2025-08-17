import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ project }) {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  const projectId = project?._id;

  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?projectId=${projectId}`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, [projectId]);

  const getTasksForDate = (d) =>
    tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === d.getFullYear() &&
        taskDate.getMonth() === d.getMonth() &&
        taskDate.getDate() === d.getDate()
      );
    });

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayTasks = getTasksForDate(date);
      if (dayTasks.length > 0) {
        return (
          <div className="mt-1 flex flex-col gap-1">
            {dayTasks.map((task) => (
              <span
                key={task._id}
                className="bg-indigo-100 text-indigo-800 text-xs rounded-full px-2 py-0.5 truncate cursor-pointer hover:bg-indigo-200 hover:text-indigo-900 transition"
                title={task.name}
              >
                {task.name}
              </span>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
        Calendar View – {project?.title}
      </h1>
<div className="flex flex-col lg:flex-row gap-6">
  {/* Calendar Section */}
  <div className="flex-1 bg-white shadow-2xl rounded-3xl overflow-hidden p-6 transition-transform hover:scale-[1.01]">
    <Calendar
      onChange={setDate}
      value={date}
      tileContent={tileContent}
      className="react-calendar border-none text-gray-700 font-medium w-full"
    />
  </div>

  {/* Selected Date & Tasks */}
  <div className="flex-1 mt-6 lg:mt-0 p-6 bg-gray-50 rounded-3xl shadow-inner">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
      {date.toDateString()}
    </h2>
    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
      {getTasksForDate(date).length > 0 ? (
        getTasksForDate(date).map((task) => (
          <div
            key={task._id}
            className="flex items-center justify-between p-3 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer hover:scale-[1.02]"
            title={task.name}
          >
            <div className="flex-1">
              <p className="text-gray-800 font-medium truncate">{task.name}</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">
                {task.description || "No description"}
              </p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                task.status === "todo"
                  ? "bg-indigo-100 text-indigo-800"
                  : task.status === "inprogress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {task.status}
            </span>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center mt-10">No tasks for this day.</p>
      )}
    </div>
  </div>
</div>

      <style jsx global>{`
        /* Highlight current day */
        .react-calendar__tile--now {
          background: #e0e7ff !important;
          border-radius: 50%;
        }

        /* Hover effect for days */
        .react-calendar__tile:hover {
          background: #dbeafe !important;
          border-radius: 50%;
          transition: background 0.2s;
        }

        /* Different font for weekdays */
        .react-calendar__month-view__weekdays {
          font-weight: 600;
          color: #4b5563;
        }

        /* Remove default border */
        .react-calendar {
          border: none;
        }
      `}</style>
    </div>
  );
}
