const { google } = require('googleapis');
const config = require('../config/config');
const { AppError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const logger = createLogger('sheet_service');

async function getSheetsClient() {
  let auth;
  
  // Support both file-based and JSON string credentials (for cloud deployments)
  if (config.google.credentialsJson) {
    // Use JSON string from environment variable (Railway/Render)
    const credentials = JSON.parse(config.google.credentialsJson);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } else {
    // Use file path (local development)
    auth = new google.auth.GoogleAuth({
      keyFile: config.google.credentialsFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }
  
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// Mapping helpers
const COLUMNS = [
  'slNo',
  'date',
  'title',
  'description',
  'comments',
  'owner',
  'collaborators',
  'priority',
  'category',
  'status',
  'noOfDays'
];

function rowToTask(row, rowIndex) {
  const task = {};
  COLUMNS.forEach((key, idx) => {
    task[key] = row[idx] || '';
  });
  task._rowIndex = rowIndex;
  return task;
}

function taskToRow(task) {
  return COLUMNS.map((key) => task[key] || '');
}

async function fetch_tasks() {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.google.sheetsSpreadsheetId,
      range: `${config.google.sheetName}!B2:L`
    });
    const rows = res.data.values || [];
    return rows.map((row, idx) => rowToTask(row, idx + 2));
  } catch (err) {
    logger.error('Failed to fetch tasks', { error: err.message });
    throw new AppError('Unable to fetch tasks', 503);
  }
}

async function create_task(task) {
  try {
    const sheets = await getSheetsClient();
    const row = taskToRow(task);
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.google.sheetsSpreadsheetId,
      range: `${config.google.sheetName}!B2:L`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });
  } catch (err) {
    logger.error('Failed to create task', { error: err.message });
    throw new AppError('Unable to create task', 503);
  }
}

async function update_task(task) {
  if (!task._rowIndex) {
    throw new AppError('Task row index missing', 400);
  }
  try {
    const sheets = await getSheetsClient();
    const row = taskToRow(task);
    const range = `${config.google.sheetName}!B${task._rowIndex}:L${task._rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.google.sheetsSpreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });
  } catch (err) {
    logger.error('Failed to update task', { error: err.message });
    throw new AppError('Unable to update task', 503);
  }
}

async function get_tasks_by_owner(owner) {
  const tasks = await fetch_tasks();
  return tasks.filter(
    (t) =>
      t.owner &&
      t.owner.toString().trim().toLowerCase() ===
        owner.toString().trim().toLowerCase()
  );
}

async function get_p1_tasks() {
  const tasks = await fetch_tasks();
  return tasks.filter(
    (t) => t.priority && t.priority.toUpperCase() === 'P1'
  );
}

module.exports = {
  fetch_tasks,
  create_task,
  update_task,
  get_tasks_by_owner,
  get_p1_tasks
};

