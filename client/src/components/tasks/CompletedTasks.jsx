// src/components/CompletedTasks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { NODE_API } from '../../../api';
import { useNavigate } from 'react-router-dom';
import PlannerHeader from './PlannerHeader';

export default function CompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');

  const fetchCompleted = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${NODE_API}/tasks?status=complete`, {
        headers: { 'x-user-email': email },
      });
      setTasks(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const statusBadge = {
    complete: 'bg-green-900/60 text-green-300 border border-green-700/50',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-950 text-gray-100 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <PlannerHeader currentPageTitle="Completed Tasks" />

        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/planner/active')}
            className="px-8 py-4 bg-red-700/80 hover:bg-red-600 backdrop-blur-sm border border-red-600/50 rounded-xl font-medium text-white transition-all shadow-lg shadow-red-900/30"
          >
            ← Back to Active Tasks
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-center mb-6 bg-red-950/50 p-4 rounded-xl border border-red-800/50">
            {error}
          </p>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading completed tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-12 italic">
            No completed tasks yet.
          </div>
        ) : (
          <div className="space-y-5">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-gray-900/70 backdrop-blur-md border border-indigo-800/40 rounded-2xl p-6 shadow-xl shadow-black/40"
              >
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h3 className="font-semibold text-lg text-green-300 line-through">
                    {task.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs rounded-full ${statusBadge[task.status]}`}>
                    COMPLETED
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  {Math.floor(task.timeEstimate / 60)}h {task.timeEstimate % 60}m
                </p>

                {task.subtasks?.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-indigo-800/50 pt-4">
                    {task.subtasks.map((sub) => (
                      <div key={sub._id} className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span className="line-through text-gray-300">
                          {sub.title} ({Math.floor(sub.timeEstimate / 60)}h {sub.timeEstimate % 60}m)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}