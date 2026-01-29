// backend/routes/task.js
import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { authByEmail } from '../middleware/auth.js'; // Assuming you have this file, based on provided code

const router = express.Router();

router.use(authByEmail); // Protect all task routes

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;