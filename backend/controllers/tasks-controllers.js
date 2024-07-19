const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Task = require('../models/task')
const User = require('../models/user');

const getTasksByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithTasks;

    try {
        userWithTasks = await User.findById(userId).populate('tasks');
    } catch (err) {
        const error = new HttpError(
            'Fetching tasks failed, please try again later.',
            500
        );
        return next(error);
    }

    if(!userWithTasks || userWithTasks.length === 0) {
           return next(
            new HttpError('Could not find a tasks for the provided user id.', 404)
           );
    }
    
    res.json({ 
        tasks: userWithTasks.tasks.map(task => 
            task.toObject({ getters: true })
        ) 
    });
};

const createTask = async (req, res , next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { description, date } = req.body;

    const createdTask = new Task ({
        description,
        date,
        creator: req.userData.userId
    });

    let user; 

    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError(
        'Creating task failed, please try again.',
        500
      );
      return next(error);  
    }

    if (!user) {
        const error = new HttpError(
            'Could not find user for the provided id.',
            404
        );
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdTask.save({ session: sess });
        user.tasks.push(createdTask);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating task failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({task: createdTask});
};

const editTask = async (req, res , next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        ); 
    }

    const { description, date } = req.body;
    const taskId = req.params.tid;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not edit task.',
            500
        );
        return next(error);
    }

    task.description = description;
    task.date = date;

    try {
        await task.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not edit task. it cannot saved', 
            500
        );
        return next(error);
    }

    res.status(200).json({ task : task.toObject({ getters: true }) });
};

const deleteTask = async (req, res, next) => {
    const taskId = req.params.tid;
    
    let task;
    try {
        task = await Task.findById(taskId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find and delete task.', 
            500
        );
        return next(error);
    }

    if (!task) {
        const error = new HttpError(
            'Could not find task for this id.',
            404
        );
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await task.deleteOne({ session: sess });
        task.creator.tasks.pull(taskId);
        await task.creator.save({ session: sess })
        await sess.commitTransaction();
    } catch (err) { 
        const error = new HttpError(
            'Something went wrong, could not delete task.', 
            500
        ); 
        return next(error);
    }

    res.status(200).json({ message: 'Task is successfully deleted.' });
};


exports.getTasksByUserId = getTasksByUserId;
exports.createTask = createTask;
exports.editTask = editTask;
exports.deleteTask = deleteTask; 