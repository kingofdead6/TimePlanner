// backend/controllers/taskController.js
import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';

/**
 * Get all tasks for the user, including subtasks
 * GET /tasks
 * Supports query params: ?day=YYYY-MM-DD (filter tasks assigned to that day), ?status=complete (for completed list)
 */
export const getTasks = asyncHandler(async (req, res) => {
  const { day, status } = req.query;
  const userId = req.userId;

  let query = { userId };

  if (status) {
    query.status = status;
  }

  if (day) {
    // Convert day to Date and find tasks where assignedDays includes that day
    const targetDate = new Date(day);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    query.assignedDays = { $elemMatch: { $gte: startOfDay, $lte: endOfDay } };
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  // To handle hierarchy, build a tree structure
  const taskMap = {};
  const rootTasks = [];

  tasks.forEach((task) => {
    taskMap[task._id] = { ...task.toObject(), subtasks: [] };
  });

  tasks.forEach((task) => {
    if (task.parentId) {
      if (taskMap[task.parentId]) {
        taskMap[task.parentId].subtasks.push(taskMap[task._id]);
      }
    } else {
      rootTasks.push(taskMap[task._id]);
    }
  });

  res.status(200).json(rootTasks);
});

/**
 * Create a new task or subtask
 * POST /tasks
 * Body: { title, timeEstimate, parentId (optional), assignedDays (optional array of YYYY-MM-DD) }
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, timeEstimate, parentId, assignedDays } = req.body;
  const userId = req.userId;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  // Convert assignedDays strings to Dates
  const parsedDays = assignedDays ? assignedDays.map((d) => new Date(d)) : [new Date()];

  const task = await Task.create({
    userId,
    title,
    timeEstimate: timeEstimate || 0,
    parentId: parentId || null,
    assignedDays: parsedDays,
  });

  res.status(201).json(task);
});

/**
 * Update a task
 * PUT /tasks/:id
 * Body: { title, status, timeEstimate, assignedDays (array of YYYY-MM-DD) }
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, status, timeEstimate, assignedDays } = req.body;
  const userId = req.userId;

  const task = await Task.findOne({ _id: id, userId });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (title) task.title = title;
  if (status) task.status = status;
  if (timeEstimate !== undefined) task.timeEstimate = timeEstimate;
  if (assignedDays) {
    task.assignedDays = assignedDays.map((d) => new Date(d));
  }

  await task.save();

  res.status(200).json(task);
});

/**
 * Delete a task and its subtasks
 * DELETE /tasks/:id
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  // Find the task
  const task = await Task.findOne({ _id: id, userId });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Delete subtasks recursively
  await Task.deleteMany({ userId, parentId: id });

  // Delete the task
  await Task.deleteOne({ _id: id });

  res.status(200).json({ message: 'Task deleted' });
});