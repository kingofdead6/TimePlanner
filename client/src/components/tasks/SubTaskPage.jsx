// src/components/SubtaskPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { NODE_API } from '../../../api';
import SubtaskItem from './SubtaskItem';

export default function SubtaskPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New subtask form
  const [newTitle, setNewTitle] = useState('');
  const [newHours, setNewHours] = useState(0);
  const [newMinutes, setNewMinutes] = useState(30);

  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: allTasks } = await axios.get(`${NODE_API}/tasks`, {
        headers: { 'x-user-email': email },
      });
      const mainTask = allTasks.find(t => t._id === taskId);
      if (mainTask) {
        setTask(mainTask);
        setSubtasks(mainTask.subtasks || []);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subtasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const addSubtask = async () => {
    if (!newTitle.trim()) return;
    const timeInMinutes = (Number(newHours) || 0) * 60 + (Number(newMinutes) || 0);

    try {
      await axios.post(
        `${NODE_API}/tasks`,
        {
          title: newTitle.trim(),
          timeEstimate: timeInMinutes,
          parentId: taskId,
          assignedDays: task?.assignedDays || [],
        },
        { headers: { 'x-user-email': email } }
      );
      fetchData();
      setNewTitle('');
      setNewHours(0);
      setNewMinutes(30);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add subtask');
    }
  };

  const updateSubtask = async (id, updates) => {
    try {
      await axios.put(`${NODE_API}/tasks/${id}`, updates, {
        headers: { 'x-user-email': email },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update subtask');
    }
  };

  const deleteSubtask = async (id) => {
    if (!window.confirm('Delete this subtask?')) return;
    try {
      await axios.delete(`${NODE_API}/tasks/${id}`, {
        headers: { 'x-user-email': email },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete subtask');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-indigo-950 flex items-center justify-center text-gray-300">
      Loading subtasks...
    </div>
  );

  if (error || !task) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-indigo-950 flex items-center justify-center text-red-400">
      {error || 'Task not found'}
    </div>
  );

  const isComplete = task.status === 'complete';
  const timeDisplay = `${Math.floor(task.timeEstimate / 60)}h ${task.timeEstimate % 60}m`;

  const statusBadge = {
    not_active: 'bg-gray-700/50 text-gray-300',
    in_process: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50',
    complete: 'bg-green-900/60 text-green-300 border border-green-700/50',
  };

  const statusText = {
    not_active: 'text-gray-400',
    in_process: 'text-yellow-400',
    complete: 'text-green-400 line-through',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-950 text-gray-100 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/planner/active')}
          className="mb-6 px-6 py-3 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-white font-medium transition-colors shadow-lg shadow-indigo-900/30"
        >
          ← Back to Active Tasks
        </button>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-3xl font-bold text-purple-300">{task.title}</h1>
          <span className={`px-3 py-1 text-sm rounded-full ${statusBadge[task.status || 'not_active']}`}>
            {task.status === 'not_active' ? 'Not Started' :
             task.status === 'in_process' ? 'In Progress' :
             'Completed'}
          </span>
        </div>

        <p className={`mb-8 ${statusText[task.status || 'not_active']}`}>
          {timeDisplay} • {task.status.replace('_', ' ').toUpperCase()}
        </p>

        {!isComplete && (
          <div className="mb-10 bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-indigo-800/40 shadow-xl">
            <input
              type="text"
              placeholder="New subtask title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-800 border border-indigo-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  value={newHours}
                  onChange={(e) => setNewHours(Math.max(0, Number(e.target.value)))}
                  className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                  className="w-full p-3 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={addSubtask}
              disabled={!newTitle.trim()}
              className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl text-white font-medium disabled:opacity-50 transition-colors"
            >
              Add Subtask
            </button>
          </div>
        )}

        <div className="space-y-5">
          {subtasks.map((sub) => (
            <SubtaskItem
              key={sub._id}
              sub={sub}
              updateSubtask={updateSubtask}
              deleteSubtask={deleteSubtask}
              isParentComplete={isComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}