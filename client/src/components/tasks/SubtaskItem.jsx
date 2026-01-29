// src/components/SubtaskItem.jsx
import { useState } from 'react';

export default function SubtaskItem({ sub, updateSubtask, deleteSubtask, isParentComplete }) {
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(sub.title);
  const [editedHours, setEditedHours] = useState(Math.floor(sub.timeEstimate / 60));
  const [editedMinutes, setEditedMinutes] = useState(sub.timeEstimate % 60);
  const [editedStatus, setEditedStatus] = useState(sub.status);

  const isComplete = sub.status === 'complete' || isParentComplete;

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
    const totalMinutes = (Number(editedHours) || 0) * 60 + (Number(editedMinutes) || 0);
    updateSubtask(sub._id, {
      title: editedTitle.trim(),
      timeEstimate: totalMinutes,
      status: editedStatus,
    });
    setEditing(false);
  };

  const timeDisplay = `${Math.floor(sub.timeEstimate / 60)}h ${sub.timeEstimate % 60}m`;

  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-5 shadow-md">
      {editing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
            placeholder="Subtask title"
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
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className={`font-medium text-lg ${statusStyles[sub.status || 'not_active']}`}>
              {sub.title}
            </div>
            <span className={`px-3 py-1 text-xs rounded-full ${statusBadge[sub.status || 'not_active']}`}>
              {sub.status === 'not_active' ? 'Not Started' :
               sub.status === 'in_process' ? 'In Progress' :
               'Completed'}
            </span>
          </div>

          <div className={`text-sm mb-4 ${statusStyles[sub.status || 'not_active']}`}>
            {timeDisplay} • {sub.status.replace('_', ' ').toUpperCase()}
          </div>

          {!isComplete && (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-white text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteSubtask(sub._id)}
                className="px-5 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-white text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}