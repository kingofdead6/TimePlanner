// src/components/TaskList.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, addTask, updateTask, deleteTask, extendTask, loading }) {
  const [newTitle, setNewTitle] = useState('');
  const [newHours, setNewHours] = useState(0);
  const [newMinutes, setNewMinutes] = useState(30);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const timeInMinutes = (Number(newHours) || 0) * 60 + (Number(newMinutes) || 0);
    addTask(newTitle.trim(), timeInMinutes);
    setNewTitle('');
    setNewHours(0);
    setNewMinutes(30);
  };

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-purple-300">Active Tasks</h2>

      <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-indigo-800/40 mb-8 shadow-xl">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-800 border border-indigo-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hours</label>
            <input
              type="number"
              min="0"
              value={newHours}
              onChange={(e) => setNewHours(Math.max(0, Number(e.target.value)))}
              className="w-full p-4 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
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
              className="w-full p-4 bg-gray-800 border border-indigo-700 rounded-xl text-white text-center focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50"
        >
          Add Task
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 italic">
          No tasks for this day yet. Add one above!
        </div>
      ) : (
        <div className="space-y-5">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              addSubtask={(title, time) => addTask(title, time, task._id)}
              updateTask={updateTask}
              deleteTask={deleteTask}
              extendTask={extendTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}