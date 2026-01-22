export interface PersonalChat {
  id: string;
  participant1: string; // Current user
  participant2: string; // Other user
  createdAt: string;
  lastActivityAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  author: string;
  body: string;
  createdAt: string;
}

const CHATS_KEY = 'task_tracker_personal_chats';
const CHAT_MESSAGES_KEY = 'task_tracker_personal_chat_messages';

interface ChatStore {
  chats: PersonalChat[];
  messages: ChatMessage[];
}

function loadStore(): ChatStore {
  if (typeof window === 'undefined') {
    return { chats: [], messages: [] };
  }
  try {
    const c = window.localStorage.getItem(CHATS_KEY);
    const m = window.localStorage.getItem(CHAT_MESSAGES_KEY);
    return {
      chats: c ? JSON.parse(c) : [],
      messages: m ? JSON.parse(m) : []
    };
  } catch {
    return { chats: [], messages: [] };
  }
}

function saveStore(store: ChatStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHATS_KEY, JSON.stringify(store.chats));
    window.localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(store.messages));
  } catch {
    // ignore quota errors
  }
}

// Get chat ID for two participants (order-independent)
function getChatId(user1: string, user2: string): string {
  const sorted = [user1.toLowerCase(), user2.toLowerCase()].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

// Find or create a chat between two users
export async function getOrCreateChat(
  currentUser: string,
  otherUser: string
): Promise<PersonalChat> {
  const store = loadStore();
  const chatId = getChatId(currentUser, otherUser);
  
  let chat = store.chats.find(
    (c) => getChatId(c.participant1, c.participant2) === chatId
  );

  if (!chat) {
    const now = new Date().toISOString();
    chat = {
      id: chatId,
      participant1: currentUser,
      participant2: otherUser,
      createdAt: now,
      lastActivityAt: now
    };
    store.chats.push(chat);
    saveStore(store);
  }

  return chat;
}

// List all chats for a user (only chats they're part of)
export async function listChatsForUser(username: string): Promise<PersonalChat[]> {
  const store = loadStore();
  const userChats = store.chats.filter(
    (c) =>
      c.participant1.toLowerCase() === username.toLowerCase() ||
      c.participant2.toLowerCase() === username.toLowerCase()
  );
  
  return [...userChats].sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
}

// Get chat by ID
export async function getChatById(chatId: string): Promise<PersonalChat | undefined> {
  const store = loadStore();
  return store.chats.find((c) => c.id === chatId);
}

// Get the other participant's name
export function getOtherParticipant(chat: PersonalChat, currentUser: string): string {
  if (chat.participant1.toLowerCase() === currentUser.toLowerCase()) {
    return chat.participant2;
  }
  return chat.participant1;
}

// Get messages for a chat
export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  const store = loadStore();
  return store.messages
    .filter((m) => m.chatId === chatId)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

// Add a message to a chat
export async function addChatMessage(
  chatId: string,
  author: string,
  body: string
): Promise<{ chat: PersonalChat; message: ChatMessage }> {
  const store = loadStore();
  const chatIndex = store.chats.findIndex((c) => c.id === chatId);
  
  if (chatIndex === -1) {
    throw new Error('Chat not found');
  }

  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    chatId,
    author,
    body,
    createdAt: now
  };

  store.messages.push(message);
  store.chats[chatIndex] = {
    ...store.chats[chatIndex],
    lastActivityAt: now
  };
  saveStore(store);

  return { chat: store.chats[chatIndex], message };
}
