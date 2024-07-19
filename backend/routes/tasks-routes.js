const express = require('express');
const { check } = require('express-validator');

const tasksControllers = require('../controllers/tasks-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/user/:uid', tasksControllers.getTasksByUserId);

router.post(
  '/',
  [
    check('description').not().isEmpty(),
    check('date').not().isEmpty()
  ],
  tasksControllers.createTask
);

router.patch(
  '/:tid',
  [
    check('description').not().isEmpty(),
    check('date').not().isEmpty()
  ],
  tasksControllers.editTask
);

router.delete('/:tid', tasksControllers.deleteTask);

module.exports = router;
