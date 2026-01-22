export interface User {
  username: string;
  role: string;
  email: string;
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

// API base URL - defaults to relative URLs for web, can be overridden via env var for mobile
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || 'Request failed');
  }
  return res.json();
}

export async function loginApi(
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
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
