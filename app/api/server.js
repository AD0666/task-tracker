const express = require('express');
const cors = require('cors');
const config = require('../config/config');
const { httpLoggerMiddleware } = require('../utils/logger');
const { errorMiddleware, AppError } = require('../utils/errors');
const {
  login,
  logout,
  authMiddleware,
  authorize_role,
  get_current_user
} = require('../auth_service');
const {
  fetch_tasks,
  create_task,
  update_task,
  get_tasks_by_owner,
  get_p1_tasks
} = require('../sheet_service');
const {
  assign_owner,
  change_priority,
  update_status,
  is_overdue
} = require('../task_service');
const { on_priority_change } = require('../notification_service');

const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLoggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.post('/auth/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await login(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout', authMiddleware, (req, res) => {
  logout();
  res.json({ success: true });
});

// Tasks routes (secured)
app.get('/tasks', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await fetch_tasks();
    const now = new Date();
    const decorated = tasks.map((t) => ({
      ...t,
      isOverdue: is_overdue(t, now)
    }));
    res.json(decorated);
  } catch (err) {
    next(err);
  }
});

app.get('/tasks/my', authMiddleware, async (req, res, next) => {
  try {
    const user = get_current_user(req);
    const tasks = await get_tasks_by_owner(user.username);
    const now = new Date();
    const decorated = tasks.map((t) => ({
      ...t,
      isOverdue: is_overdue(t, now)
    }));
    res.json(decorated);
  } catch (err) {
    next(err);
  }
});

app.get('/tasks/p1', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await get_p1_tasks();
    const now = new Date();
    const decorated = tasks.map((t) => ({
      ...t,
      isOverdue: is_overdue(t, now)
    }));
    res.json(decorated);
  } catch (err) {
    next(err);
  }
});

app.get('/tasks/overdue', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await fetch_tasks();
    const now = new Date();
    const overdue = tasks
      .filter((t) => is_overdue(t, now))
      .map((t) => ({ ...t, isOverdue: true }));
    res.json(overdue);
  } catch (err) {
    next(err);
  }
});

// Create task – any authenticated user can create tasks for themselves.
// Admins may optionally specify a different owner in the payload.
app.post('/tasks', authMiddleware, async (req, res, next) => {
  try {
    const user = get_current_user(req);
    let task = req.body || {};

    if (user.role === 'admin' && task.owner) {
      // Admin can create tasks for others
      task = assign_owner(task, task.owner);
    } else {
      // Non-admins always create tasks assigned to themselves
      task = assign_owner(task, user.username);
    }

    // Ensure required defaults
    if (!task.status) {
      task = update_status(task, 'Not Done');
    }
    if (!task.priority) {
      task = change_priority(task, 'P2');
    }

    await create_task(task);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Update task, including priority / status changes
app.put('/tasks/:rowIndex', authMiddleware, async (req, res, next) => {
  const rowIndex = Number(req.params.rowIndex);
  if (!rowIndex) {
    return next(new AppError('Invalid row index', 400));
  }
  try {
    const existingTasks = await fetch_tasks();
    const original = existingTasks.find((t) => t._rowIndex === rowIndex);
    if (!original) {
      return next(new AppError('Task not found', 404));
    }

    let updated = { ...original, ...req.body, _rowIndex: rowIndex };

    if (req.body.owner && req.body.owner !== original.owner) {
      updated = assign_owner(updated, req.body.owner);
    }
    if (req.body.priority && req.body.priority !== original.priority) {
      updated = change_priority(updated, req.body.priority);
    }
    if (req.body.status && req.body.status !== original.status) {
      updated = update_status(updated, req.body.status);
    }

    await update_task(updated);

    const user = get_current_user(req);
    if (updated.priority === 'P1' && updated.status !== 'Done') {
      await on_priority_change(updated, user);
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((req, res, next) => {
  next(new AppError('Not Found', 404));
});

// Centralized error handler
app.use(errorMiddleware);

// Use PORT from environment (cPanel provides this) or fallback to config
const PORT = process.env.PORT || config.port;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${PORT}`);
});

module.exports = app;

