// src/components/ActiveTasks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { NODE_API } from '../../../api';
import { useNavigate } from 'react-router-dom';
import TaskItem from './TaskItem';
import PlannerHeader from './PlannerHeader';

export default function ActiveTasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newHours, setNewHours] = useState(0);
  const [newMinutes, setNewMinutes] = useState(30);

  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${NODE_API}/tasks?day=${selectedDay}`, {
        headers: { 'x-user-email': email },
      });
      setTasks(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDay]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    const timeInMinutes = (Number(newHours) || 0) * 60 + (Number(newMinutes) || 0);

    try {
      await axios.post(
        `${NODE_API}/tasks`,
        {
          title: newTitle.trim(),
          timeEstimate: timeInMinutes,
          assignedDays: [selectedDay],
        },
        { headers: { 'x-user-email': email } }
      );
      fetchTasks();
      setNewTitle('');
      setNewHours(0);
      setNewMinutes(30);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add task');
    }
  };

  const updateTask = async (id, updates) => {
    try {
      await axios.put(`${NODE_API}/tasks/${id}`, updates, {
        headers: { 'x-user-email': email },
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete task and subtasks?')) return;
    try {
      await axios.delete(`${NODE_API}/tasks/${id}`, {
        headers: { 'x-user-email': email },
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const extendTask = (task) => {
    const nextDay = new Date(selectedDay);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextStr = nextDay.toISOString().split('T')[0];

    const currentDays = task.assignedDays || [];
    const updated = [
      ...currentDays.map(d => new Date(d).toISOString().split('T')[0]),
      nextStr,
    ];

    updateTask(task._id, { assignedDays: updated });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-950 text-gray-100 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <PlannerHeader currentPageTitle="Active Tasks" />

        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/planner/completed')}
            className="px-8 py-4 bg-red-700/80 hover:bg-red-600 backdrop-blur-sm border border-red-600/50 rounded-xl font-medium text-white transition-all shadow-lg shadow-red-900/30"
          >
            View Completed Tasks →
          </button>
        </div>

        <div className="mb-10 bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-indigo-800/40 shadow-xl">
          <div className="mb-5">
            <label className="block text-sm text-indigo-300 mb-2">Select Day</label>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-3.5 bg-gray-800 border border-indigo-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3.5 bg-gray-800 border border-indigo-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={newHours}
                  onChange={(e) => setNewHours(Math.max(0, Number(e.target.value)))}
                  className="w-full p-3.5 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                  className="w-full p-3.5 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={addTask}
              disabled={!newTitle.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-xl font-medium text-white disabled:opacity-50 transition-all shadow-lg shadow-purple-900/30"
            >
              Add New Task
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-center mb-6 bg-red-950/50 p-4 rounded-xl border border-red-800/50">
            {error}
          </p>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-10 italic">
            No active tasks for this day yet. Add one above!
          </div>
        ) : (
          <div className="space-y-5">
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                extendTask={extendTask}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}