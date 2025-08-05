import PageLayout from "@/components/layout/PageLayout";
import { User, Calendar, Flag, PlusCircle, } from "lucide-react";
import WorkspaceHeader from "@/components/projects/WorkspaceHeader";

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: "Project 1",
      statuses: [
        {
          id: "todo",
          label: "TO DO",
          tasks: [
            { id: 1, name: "Task 1", assignee: "John Doe", dueDate: "2025-08-10", priority: "High" },
            { id: 2, name: "Task 2", assignee: "", dueDate: "", priority: "Medium" },
            { id: 3, name: "Task 3", assignee: "Jane", dueDate: "", priority: "Low" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Project 2",
      statuses: [
        {
          id: "inprogress",
          label: "IN PROGRESS",
          tasks: [
            { id: 4, name: "Task 1", assignee: "Mark", dueDate: "2025-08-14", priority: "High" },
          ],
        },
        {
          id: "todo",
          label: "TO DO",
          tasks: [
            { id: 5, name: "Task 2", assignee: "", dueDate: "", priority: "Medium" },
            { id: 6, name: "Task 3", assignee: "", dueDate: "", priority: "Low" },
          ],
        },
      ],
    },
  ];

  return (
   <PageLayout>
   <WorkspaceHeader />

     <div className="p-6 space-y-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white border rounded-lg shadow">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <button className="text-sm text-indigo-600 hover:underline">
              + Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {project.statuses.map((status) => (
              <div key={status.id} className="border rounded">
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2">
                  <span className="text-sm font-medium">{status.label}</span>
                  <button className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                    <PlusCircle size={14} />
                    Add Task
                  </button>
                </div>

                {status.tasks.length === 0 && (
                  <div className="text-sm text-gray-500 px-3 py-2">No tasks</div>
                )}

                <ul>
                  {status.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between hover:bg-gray-50 px-3 py-2 border-t text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{task.name}</span>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {task.assignee || "Unassigned"}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {task.dueDate}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Flag size={12} />
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        ...
                      </button>
                    </li>
                  ))}
                </ul>

                <button className="w-full text-xs text-gray-500 hover:text-indigo-600 py-2 flex justify-center items-center gap-1 border-t">
                  + Add Task
                </button>
              </div>
            ))}
          </div>

          <button className="text-xs text-gray-500 hover:text-indigo-600 px-4 py-2 flex items-center gap-1 border-t w-full">
            + New Status
          </button>
        </div>
      ))}
    </div>
   </PageLayout>
  );
}
