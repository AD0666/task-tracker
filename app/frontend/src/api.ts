export interface User {
  username: string;
  role: string;
}

export interface Task {
  slNo: string;
  date: string;
  title: string;
  description: string;
  comments: string;
  owner: string;
  collaborators: string;
  priority: 'P1' | 'P2' | 'P3' | string;
  category: string;
  status: 'Not Done' | 'Discussed/WIP' | 'Done' | string;
  noOfDays: string;
  _rowIndex?: number;
  isOverdue?: boolean;
}

const TOKEN_KEY = 'task_tracker_token';
const USERNAME_KEY = 'task_tracker_username';

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setUsername(username: string | null) {
  if (username) {
    localStorage.setItem(USERNAME_KEY, username);
  } else {
    localStorage.removeItem(USERNAME_KEY);
  }
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

// API base URL - use local backend in dev, Apps Script in prod (if configured)
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000' // Use local Node.js backend in development
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'); // Fallback to local backend

// Detect if we're using Apps Script (URL contains script.google.com)
const IS_APPS_SCRIPT = API_BASE_URL.includes('script.google.com');

// Debug: Log API configuration on module load
console.log('[API] ====== API CONFIGURATION ======');
console.log('[API] DEV mode:', import.meta.env.DEV);
console.log('[API] API_BASE_URL:', API_BASE_URL);
console.log('[API] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('[API] ===============================');

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const username = getUsername();

  console.log('[API] ====== REQUEST START ======');
  console.log('[API] Input URL:', url);
  console.log('[API] API_BASE_URL:', API_BASE_URL);
  
  // Build full URL
  // For Apps Script, if URL is empty, we're hitting root /exec endpoint
  // For local backend, append the URL path normally
  let fullUrl: string;
  if (IS_APPS_SCRIPT && (url === '' || url === '/')) {
    // Apps Script root endpoint
    fullUrl = API_BASE_URL.endsWith('/exec') ? API_BASE_URL : `${API_BASE_URL}/exec`;
  } else {
    // Normal URL concatenation
    fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
  }
  
  console.log('[API] Constructed Full URL:', fullUrl);
  console.log('[API] Username from storage:', username);
  console.log('[API] Request method:', options.method || 'GET');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Authorization header for authenticated requests (except login)
  if (username && !url.includes('/auth/login')) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Log request details
  console.log('[API] Making request:', {
    method: options.method || 'GET',
    url: fullUrl,
    hasBody: !!options.body,
    bodyLength: options.body ? String(options.body).length : 0
  });
  console.log('[API] Fetch options:', {
    method: options.method || 'GET',
    headers: headers,
    body: options.body,
    cache: 'no-store'
  });
  console.log('[API] Attempting fetch to:', fullUrl);
  
  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers,
      // Standard fetch options for local backend
      cache: 'no-store',
    });
    console.log('[API] ✓ Fetch completed successfully');
  } catch (fetchError: any) {
    console.error('[API] ✗ Fetch failed with error:', fetchError);
    console.error('[API] Error name:', fetchError?.name);
    console.error('[API] Error message:', fetchError?.message);
    console.error('[API] Error stack:', fetchError?.stack);
    console.error('[API] Failed URL:', fullUrl);
    console.error('[API] ====== REQUEST END (ERROR) ======');
    throw new Error(`Failed to connect to backend: ${fetchError?.message || 'Unknown error'}. URL: ${fullUrl}`);
  }

  console.log('[API] Response status:', res.status, res.statusText);
  console.log('[API] Response OK:', res.ok);
  console.log('[API] Response headers:', Object.fromEntries(res.headers.entries()));

  // Check if response is HTML (error page)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const text = await res.text().catch(() => '');
    console.error('[API] Received HTML instead of JSON!');
    console.error('[API] HTML response (first 500 chars):', text.substring(0, 500));
    throw new Error('Server returned HTML instead of JSON. Check Apps Script deployment settings.');
  }
  
  const body = await res.json().catch((err) => {
    console.error('[API] Failed to parse JSON:', err);
    return {};
  });
  
  console.log('[API] Response body:', body);
  
  // Apps Script always returns 200, but includes statusCode in body for errors
  if (body.statusCode && body.statusCode !== 200) {
    throw new Error(body.error?.message || 'Request failed');
  }
  
  // Also check HTTP status code (should be 200 for Apps Script, but check anyway)
  if (!res.ok) {
    throw new Error(body.error?.message || 'Request failed');
  }

  return body;
}

export async function loginApi(
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  // Apps Script doesn't handle POST with pathInfo reliably
  // Use root endpoint with action in body for Apps Script
  if (IS_APPS_SCRIPT) {
    console.log('[API] Using Apps Script login (root endpoint with action)');
    const result = await request<{ token: string; user: User }>('', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'auth/login',
        username, 
        password 
      })
    });
    
    // Store username for future authenticated requests
    if (result.user) {
      setUsername(result.user.username);
    }
    
    return result;
  }
  
  // Use standard POST to /auth/login endpoint (local Node.js backend)
  console.log('[API] Using local backend login (/auth/login)');
  const result = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  // Store username for future authenticated requests
  if (result.user) {
    setUsername(result.user.username);
  }
  
  return result;
}

export async function fetchAllTasks(): Promise<Task[]> {
  return request('/tasks');
}

export async function fetchMyTasks(): Promise<Task[]> {
  return request('/tasks/my');
}

export async function fetchP1Tasks(): Promise<Task[]> {
  return request('/tasks/p1');
}

export async function fetchOverdueTasks(): Promise<Task[]> {
  return request('/tasks/overdue');
}

export async function createTask(
  payload: Partial<Task>
): Promise<{ success: boolean }> {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateTask(
  rowIndex: number,
  payload: Partial<Task>
): Promise<{ success: boolean }> {
  return request(`/tasks/${rowIndex}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}
