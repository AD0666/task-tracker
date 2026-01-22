export type GlobalThreadStatus = 'open' | 'closed';

export interface GlobalThread {
  id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  lastActivityAt: string;
  status: GlobalThreadStatus;
}

export interface GlobalMessage {
  id: string;
  threadId: string;
  parentId?: string;
  author: string;
  body: string;
  createdAt: string;
}

const THREADS_KEY = 'task_tracker_global_threads';
const MESSAGES_KEY = 'task_tracker_global_thread_messages';
const CLOSE_AFTER_DAYS = 30;

interface ThreadStore {
  threads: GlobalThread[];
  messages: GlobalMessage[];
}

function loadStore(): ThreadStore {
  if (typeof window === 'undefined') {
    return { threads: [], messages: [] };
  }
  try {
    const t = window.localStorage.getItem(THREADS_KEY);
    const m = window.localStorage.getItem(MESSAGES_KEY);
    return {
      threads: t ? JSON.parse(t) : [],
      messages: m ? JSON.parse(m) : []
    };
  } catch {
    return { threads: [], messages: [] };
  }
}

function saveStore(store: ThreadStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THREADS_KEY, JSON.stringify(store.threads));
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(store.messages));
  } catch {
    // ignore quota errors
  }
}

function ensureFreshStatus(threads: GlobalThread[]): GlobalThread[] {
  const now = Date.now();
  const maxAgeMs = CLOSE_AFTER_DAYS * 24 * 60 * 60 * 1000;
  return threads.map((t) => {
    if (
      t.status === 'open' &&
      new Date(t.lastActivityAt).getTime() + maxAgeMs < now
    ) {
      return { ...t, status: 'closed' as GlobalThreadStatus };
    }
    return t;
  });

}

export async function listThreads(): Promise<GlobalThread[]> {
  const store = loadStore();
  const updated = ensureFreshStatus(store.threads);
  if (updated !== store.threads) {
    store.threads = updated;
    saveStore(store);
  }
  return [...updated].sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
}

export async function createThread(
  title: string,
  author: string
): Promise<GlobalThread> {
  const store = loadStore();
  const now = new Date().toISOString();
  const thread: GlobalThread = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    createdAt: now,
    createdBy: author,
    lastActivityAt: now,
    status: 'open'
  };
  store.threads = [thread, ...store.threads];
  saveStore(store);
  return thread;
}

export async function getThreadById(
  threadId: string
): Promise<GlobalThread | undefined> {
  const store = loadStore();
  const threads = ensureFreshStatus(store.threads);
  const thread = threads.find((t) => t.id === threadId);
  if (threads !== store.threads) {
    store.threads = threads;
    saveStore(store);
  }
  return thread;
}

export async function getMessages(
  threadId: string
): Promise<GlobalMessage[]> {
  const store = loadStore();
  return store.messages
    .filter((m) => m.threadId === threadId)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export async function addMessage(
  threadId: string,
  author: string,
  body: string,
  parentId?: string
): Promise<{ thread: GlobalThread; message: GlobalMessage }> {
  const store = loadStore();
  const threads = ensureFreshStatus(store.threads);
  const threadIndex = threads.findIndex((t) => t.id === threadId);
  if (threadIndex === -1) {
    throw new Error('Thread not found');
  }
  const thread = threads[threadIndex];
  if (thread.status === 'closed') {
    throw new Error('This thread is closed after inactivity');
  }
  const now = new Date().toISOString();
  const msg: GlobalMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    threadId,
    parentId,
    author,
    body,
    createdAt: now
  };
  store.messages = [...store.messages, msg];
  threads[threadIndex] = { ...thread, lastActivityAt: now };
  store.threads = threads;
  saveStore(store);
  return { thread: threads[threadIndex], message: msg };
}

