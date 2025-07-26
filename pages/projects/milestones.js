import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';

export default function MilestonesCalendar() {
  const [showAdd, setShowAdd] = useState(false);
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Project Kickoff',
      description: 'Initial planning and team meeting.',
      dueDate: '2025-08-01',
      priority: 'High',
      status: 'Not Started',
    },
    {
      id: 2,
      title: 'Design Phase Complete',
      description: 'Finish UI/UX and architecture design.',
      dueDate: '2025-08-15',
      priority: 'Medium',
      status: 'In Progress',
    },
    {
      id: 3,
      title: 'Development Complete',
      description: 'Codebase finalized and ready for testing.',
      dueDate: '2025-09-01',
      priority: 'Low',
      status: 'Completed',
    },
  ]);

  const priorityColors = {
    High: 'text-red-600',
    Medium: 'text-yellow-600',
    Low: 'text-green-600',
  };

  const statusColors = {
    'Not Started': 'bg-gray-200 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-600',
    Completed: 'bg-green-100 text-green-700',
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-sky-100 to-white min-h-screen p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-sky-900">Milestones & Calendar</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Milestone
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl shadow-md border hover:shadow-lg transition p-6 relative"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800">{m.title}</h2>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[m.status]}`}>{m.status}</span>
              </div>
              <p className="text-gray-600 mb-2">{m.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">Due: {format(new Date(m.dueDate), 'PPP')}</span>
              </div>
              <div className={`mt-3 text-sm font-semibold ${priorityColors[m.priority]}`}>
                Priority: {m.priority}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding milestone */}
        <Dialog open={showAdd} onClose={() => setShowAdd(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <Dialog.Title className="text-xl font-bold mb-4">Add New Milestone</Dialog.Title>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newMilestone = {
                    id: milestones.length + 1,
                    title: formData.get('title'),
                    description: formData.get('description'),
                    dueDate: formData.get('dueDate'),
                    priority: formData.get('priority'),
                    status: formData.get('status'),
                  };
                  setMilestones([...milestones, newMilestone]);
                  setShowAdd(false);
                }}
                className="space-y-4"
              >
                <input name="title" placeholder="Title" className="w-full p-2 border rounded" required />
                <textarea name="description" placeholder="Description" className="w-full p-2 border rounded" required />
                <input type="date" name="dueDate" className="w-full p-2 border rounded" required />
                <select name="priority" className="w-full p-2 border rounded" required>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <select name="status" className="w-full p-2 border rounded" required>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </Layout>
  );
}
