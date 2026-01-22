const { AppError } = require('../utils/errors');

function assign_owner(task, owner) {
  if (!owner) {
    throw new AppError('Owner is required', 400);
  }
  return { ...task, owner };
}

function change_priority(task, priority) {
  const allowed = ['P1', 'P2', 'P3'];
  if (!allowed.includes(priority)) {
    throw new AppError('Invalid priority', 400);
  }
  return { ...task, priority };
}

function update_status(task, status) {
  const allowed = ['Not Done', 'Discussed/WIP', 'Done'];
  if (!allowed.includes(status)) {
    throw new AppError('Invalid status', 400);
  }
  return { ...task, status };
}

function calculate_due_date(task) {
  const { date, noOfDays } = task;
  if (!date || !noOfDays) return null;
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return null;
  const days = Number(noOfDays);
  if (Number.isNaN(days)) return null;
  const due = new Date(start);
  due.setDate(due.getDate() + days);
  return due;
}

function is_overdue(task, now = new Date()) {
  const due = calculate_due_date(task);
  if (!due) return false;
  return due < now && task.status !== 'Done';
}

module.exports = {
  assign_owner,
  change_priority,
  update_status,
  calculate_due_date,
  is_overdue
};

