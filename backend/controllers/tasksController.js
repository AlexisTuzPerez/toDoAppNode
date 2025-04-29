const Task = require('../models/Task');

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user_id: req.user.id });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single task by ID (must belong to user)
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new task for the user
const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, status } = req.body;
        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            status,
            user_id: req.user.id
        });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a task (only if the user owns it)
const updateTask = async (req, res) => {
    try {
        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: 'Task not found or not authorized' });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a task (only if the user owns it)
const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        if (!deleted) return res.status(404).json({ message: 'Task not found or not authorized' });
        res.status(200).json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
