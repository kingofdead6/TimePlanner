// src/components/TaskItem.jsx
import { useState } from 'react';

export default function TaskItem({ task, updateTask, deleteTask, extendTask, navigate }) {
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedHours, setEditedHours] = useState(Math.floor(task.timeEstimate / 60));
  const [editedMinutes, setEditedMinutes] = useState(task.timeEstimate % 60);
  const [editedStatus, setEditedStatus] = useState(task.status);

  const isComplete = task.status === 'complete';

  const statusStyles = {
    not_active: 'text-gray-400',
    in_process: 'text-yellow-400 font-medium',
    complete: 'text-green-400 line-through',
  };

  const statusBadge = {
    not_active: 'bg-gray-700/50 text-gray-300',
    in_process: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50',
    complete: 'bg-green-900/60 text-green-300 border border-green-700/50',
  };

  const handleSave = () => {
    const minutes = (Number(editedHours) || 0) * 60 + (Number(editedMinutes) || 0);
    updateTask(task._id, {
      title: editedTitle.trim(),
      timeEstimate: minutes,
      status: editedStatus,
    });
    setEditing(false);
  };

  const timeDisplay = `${Math.floor(task.timeEstimate / 60)}h ${task.timeEstimate % 60}m`;

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm border border-indigo-800/50 rounded-xl p-5 shadow-md">
      {editing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
            placeholder="Task title"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                value={editedHours}
                onChange={(e) => setEditedHours(Math.max(0, Number(e.target.value)))}
                className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={editedMinutes}
                onChange={(e) => setEditedMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <select
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            disabled={isComplete}
            className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="not_active">Not Active</option>
            <option value="in_process">In Process</option>
            <option value="complete">Complete</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 rounded-xl text-white font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="cursor-pointer mb-4"
            onClick={() => !isComplete && navigate(`/planner/task/${task._id}/subtasks`)}
          >
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="font-medium text-lg text-purple-200">
                {task.title}
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${statusBadge[task.status || 'not_active']}`}>
                {task.status === 'not_active' ? 'Not Started' :
                 task.status === 'in_process' ? 'In Progress' :
                 'Completed'}
              </span>
            </div>

            <div className={`text-sm ${statusStyles[task.status || 'not_active']}`}>
              {timeDisplay} • {task.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {!isComplete && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-white text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTask(task._id)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-lg text-white text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => extendTask(task)}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors"
              >
                Extend Day
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}