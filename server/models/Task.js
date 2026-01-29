// backend/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['not_active', 'in_process', 'complete'],
      default: 'not_active',
    },
    timeEstimate: {
      type: Number, // in minutes
      default: 0,
      min: 0,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null, // null for top-level tasks
    },
    assignedDays: {
      type: [Date], // array of dates for the days the task is assigned to
      default: () => [new Date()], // default to today
    },
  },
  { timestamps: true }
);

// Index for efficient querying by user and status
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, parentId: 1 });

export default mongoose.model('Task', taskSchema);