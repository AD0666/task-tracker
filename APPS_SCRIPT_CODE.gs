// ====== CONFIG ======
const SPREADSHEET_ID = '1T4twRnuavxvmJk_qfU0leeeRy6LMrpl37z5U0uRURZM'; // your sheet
const SHEET_NAME = 'RoadMap';

// Simple in‑script users (same as current app)
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'Damon', password: 'Damon123', role: 'user' },
  { username: 'Miki', password: 'Miki123', role: 'user' },
  { username: 'James', password: 'James123', role: 'user' },
  { username: 'Anup', password: 'Anup123', role: 'user' }
];

// Columns B–L (same mapping as Node sheet_service)
const COLUMNS = [
  'slNo',       // B
  'date',       // C
  'title',      // D
  'description',// E
  'comments',   // F
  'owner',      // G
  'collaborators', // H
  'priority',   // I
  'category',   // J
  'status',     // K
  'noOfDays'    // L
];

// ====== UTILITIES ======

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME);
}

function rowsToTasks(rows, startRowIndex) {
  return rows.map(function (row, idx) {
    const task = {};
    COLUMNS.forEach(function (key, i) {
      task[key] = row[i] || '';
    });
    // real row index in sheet (since we start at row 2, B2)
    task._rowIndex = startRowIndex + idx;
    return task;
  });
}

function taskToRow(task) {
  return COLUMNS.map(function (key) {
    return task[key] || '';
  });
}

function parseJsonBody(e) {
  try {
    // Apps Script receives POST data in e.postData.contents
    var postData = e.postData;
    if (postData && postData.contents) {
      return JSON.parse(postData.contents);
    }
    // Fallback: try to get from parameter if available
    if (e.parameter && e.parameter.body) {
      return JSON.parse(e.parameter.body);
    }
    return {};
  } catch (err) {
    // Log error for debugging (check Apps Script execution log)
    Logger.log('Error parsing JSON body: ' + err.toString());
    return {};
  }
}

function jsonResponse(obj, statusCode) {
  // Create JSON response
  var response = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Note: Apps Script Web Apps return HTTP 200, but we include status in body
  return response;
}

// Simple auth – returns user without JWT (frontend already just stores username/role)
function loginHandler(body) {
  // Debug logging
  Logger.log('loginHandler called');
  Logger.log('Body received: ' + JSON.stringify(body));
  Logger.log('Body type: ' + typeof body);
  Logger.log('Body.username: ' + (body.username || 'MISSING'));
  Logger.log('Body.password: ' + (body.password ? 'PRESENT' : 'MISSING'));
  
  var username = (body.username || '').trim();
  var password = body.password || '';
  
  Logger.log('Parsed username: ' + username);
  Logger.log('Parsed password length: ' + password.length);

  var user = USERS.find(function (u) {
    var match = u.username === username && u.password === password;
    Logger.log('Checking user: ' + u.username + ', match: ' + match);
    return match;
  });

  if (!user) {
    Logger.log('Login failed: No matching user found');
    Logger.log('Available users: ' + USERS.map(function(u) { return u.username; }).join(', '));
    return {
      status: 401,
      body: { error: { message: 'Invalid credentials' } }
    };
  }

  Logger.log('Login successful for user: ' + user.username);
  return {
    status: 200,
    body: {
      user: { username: user.username, role: user.role },
      token: 'dummy-token-' + user.username // keep shape similar; not validated server‑side
    }
  };
}

// ====== TASK HANDLERS ======

function fetchAllTasks() {
  var sheet = getSheet();
  var range = sheet.getRange('B2:L'); // same as backend
  var values = range.getValues();
  // Trim trailing empty rows
  var rows = values.filter(function (r) {
    return r.join('') !== '';
  });
  return rowsToTasks(rows, 2);
}

function isOverdue(task) {
  if (!task.date || !task.noOfDays) return false;
  var base = new Date(task.date);
  if (isNaN(base.getTime())) return false;
  var days = parseInt(task.noOfDays, 10);
  if (isNaN(days)) return false;
  var due = new Date(base);
  due.setDate(due.getDate() + days);
  var today = new Date();
  return today > due && String(task.status).toLowerCase() !== 'done';
}

function tasksHandler(path, method, body, user) {
  var tasks = fetchAllTasks();

  if (method === 'GET') {
    if (path === '/tasks') {
      return { status: 200, body: tasks };
    }
    if (path === '/tasks/my') {
      var my = tasks.filter(function (t) {
        return t.owner && t.owner.toString().trim().toLowerCase() === user.username.toLowerCase();
      });
      return { status: 200, body: my };
    }
    if (path === '/tasks/p1') {
      var p1 = tasks.filter(function (t) {
        return t.priority && t.priority.toString().toUpperCase() === 'P1';
      });
      return { status: 200, body: p1 };
    }
    if (path === '/tasks/overdue') {
      var overdue = tasks.filter(isOverdue);
      return { status: 200, body: overdue };
    }
  }

  if (method === 'POST' && path === '/tasks') {
    // create task
    var newTask = body;
    var sheet = getSheet();
    var row = taskToRow(newTask);
    sheet.appendRow([''].concat(row)); // prepend column A (Sl No or empty)
    return { status: 201, body: { success: true } };
  }

  if (method === 'PUT' && path.indexOf('/tasks/') === 0) {
    var parts = path.split('/');
    var rowIndex = parseInt(parts[2], 10);
    if (!rowIndex || isNaN(rowIndex)) {
      return { status: 400, body: { error: { message: 'Invalid row index' } } };
    }
    var sheet2 = getSheet();
    var range = sheet2.getRange('B' + rowIndex + ':L' + rowIndex);
    var updateRow = taskToRow(body);
    range.setValues([updateRow]);
    return { status: 200, body: { success: true } };
  }

  return { status: 404, body: { error: { message: 'Not found' } } };
}

// ====== MAIN ENTRY (GET/POST/OPTIONS) ======

/**
 * Web App entrypoint – supports paths like:
 *   /exec/auth/login
 *   /exec/tasks
 *   /exec/tasks/my
 */
function doPost(e) {
  // Check if this is a preflight OPTIONS request
  if (e.parameter && e.parameter.method === 'OPTIONS') {
    return handleCorsPreflight();
  }
  return handleRequest(e, 'POST');
}

function doGet(e) {
  // Check if this is a preflight OPTIONS request  
  if (e.parameter && e.parameter.method === 'OPTIONS') {
    return handleCorsPreflight();
  }
  return handleRequest(e, 'GET');
}

function doOptions(e) {
  return handleCorsPreflight();
}

function handleCorsPreflight() {
  // Handle CORS preflight OPTIONS requests
  // Apps Script doesn't support setHeader, but Web Apps handle CORS automatically
  // Return empty response - the deployment settings handle CORS
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function handleRequest(e, method) {
  var pathInfo = e.pathInfo || '';
  var body = method === 'POST' ? parseJsonBody(e) : {};
  
  // Debug logging
  Logger.log('=== REQUEST START ===');
  Logger.log('Method: ' + method);
  Logger.log('PathInfo: ' + pathInfo);
  Logger.log('Body: ' + JSON.stringify(body));
  Logger.log('Parameters: ' + JSON.stringify(e.parameter));
  
  // NEW APPROACH: For POST, route based on body.action or query parameter
  // This avoids pathInfo issues with POST requests
  if (method === 'POST') {
    // Check body.action first, then query parameter, then pathInfo
    var action = (body.action || e.parameter.action || pathInfo || '').toString().trim();
    
    // Remove leading slash if present
    if (action.startsWith('/')) {
      action = action.substring(1);
    }
    
    Logger.log('POST Action determined: ' + action);
    
    if (action === 'auth/login' || action === 'login') {
      // Remove action from body before passing to handler
      var loginBody = Object.assign({}, body);
      delete loginBody.action;
      Logger.log('Calling loginHandler with:', JSON.stringify(loginBody));
      result = loginHandler(loginBody);
    } else if (action === 'tasks' || action === 'tasks/' || action.startsWith('tasks/')) {
      var username = (e.parameter.username || '').trim();
      var user = USERS.find(function (u) {
        return u.username === username;
      }) || null;
      if (!user) {
        return jsonResponse({ error: { message: 'Unauthorized' } }, 401);
      }
      result = tasksHandler('/' + action, method, body, user);
    } else {
      result = { status: 404, body: { error: { message: 'Not found', action: action } } };
    }
  } else {
    // GET requests - use pathInfo as before
    if (pathInfo.startsWith('exec/')) {
      pathInfo = pathInfo.substring(5);
    }
    var path = '/' + pathInfo;
    
    // Handle root
    if (path === '/' || path === '') {
      return jsonResponse({ 
        message: 'Apps Script Web App is running',
        method: method,
        availableEndpoints: ['POST with body.action=auth/login', '/tasks (GET)', '/tasks/my (GET)']
      }, 200);
    }
    
    // GET requests for tasks
    var username = (e.parameter.username || '').trim();
    var user = USERS.find(function (u) {
      return u.username === username;
    }) || null;
    
    if (path.indexOf('/tasks') === 0) {
      if (!user) {
        return jsonResponse({ error: { message: 'Unauthorized' } }, 401);
      }
      result = tasksHandler(path, method, body, user);
    } else {
      result = { status: 404, body: { error: { message: 'Not found', path: path } } };
    }
  }
  
  Logger.log('=== REQUEST END ===');

  // Include status in response body since Apps Script always returns 200
  var responseBody = result.body;
  if (result.status !== 200) {
    responseBody.statusCode = result.status;
  }
  
  return jsonResponse(responseBody, result.status);
}
