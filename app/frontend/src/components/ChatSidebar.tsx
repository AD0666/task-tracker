import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GlobalThread,
  listThreads,
  createThread
} from '../services/globalThreads';
import {
  PersonalChat,
  listChatsForUser,
  getOrCreateChat
} from '../services/personalChats';
import { useAuth } from '../context/AuthContext';

const KNOWN_USERS = ['Damon', 'Miki', 'James', 'Anup', 'admin'];

interface Props {
  onOpenChat?: (chatId: string) => void;
}

const ChatSidebar: React.FC<Props> = ({ onOpenChat }) => {
  const [chats, setChats] = useState<PersonalChat[]>([]);
  const [threads, setThreads] = useState<GlobalThread[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newChatUser, setNewChatUser] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on home / My Tasks routes
  const onHome = location.pathname === '/' || location.pathname === '/my-tasks';
  if (!onHome) return null;

  useEffect(() => {
    const loadChats = async () => {
      if (!user?.username) return;
      setLoadingChats(true);
      try {
        const data = await listChatsForUser(user.username);
        setChats(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load chats');
      } finally {
        setLoadingChats(false);
      }
    };
    loadChats();
  }, [user?.username]);

  useEffect(() => {
    const loadThreads = async () => {
      setLoadingThreads(true);
      try {
        const data = await listThreads();
        setThreads(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load threads');
      } finally {
        setLoadingThreads(false);
      }
    };
    loadThreads();
  }, []);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;
    try {
      const author = user?.username || 'Anonymous';
      await createThread(newThreadTitle.trim(), author);
      const data = await listThreads();
      setThreads(data);
      setNewThreadTitle('');
      navigate('/threads');
    } catch (e: any) {
      setError(e.message || 'Failed to create thread');
    }
  };

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatUser.trim() || !user?.username) return;
    const otherUser = newChatUser.trim();
    if (otherUser.toLowerCase() === user.username.toLowerCase()) {
      setError('Cannot chat with yourself');
      return;
    }
    try {
      const chat = await getOrCreateChat(user.username, otherUser);
      // refresh list so the new chat appears under "Chats"
      const updatedChats = await listChatsForUser(user.username);
      setChats(updatedChats);
      setNewChatUser('');
      if (onOpenChat) {
        onOpenChat(chat.id);
      } else {
        navigate(`/chat/${chat.id}`);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to start chat');
    }
  };

  const getOtherParticipant = (chat: PersonalChat): string => {
    if (!user?.username) return '';
    if (chat.participant1.toLowerCase() === user.username.toLowerCase()) {
      return chat.participant2;
    }
    return chat.participant1;
  };

  const availableUsers = KNOWN_USERS.filter(
    (u) => u.toLowerCase() !== user?.username?.toLowerCase()
  );

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <span className="chat-title">Chat</span>
      </div>

      {/* Personal Chats Section */}
      <div className="chat-section-label">Chats</div>
      {loadingChats && <div className="sidebar-empty">Loading chats…</div>}
      {!loadingChats &&
        chats.map((chat) => {
          const otherUser = getOtherParticipant(chat);
          return (
            <button
              key={chat.id}
              type="button"
              className="chat-thread-item"
              onClick={() =>
                onOpenChat ? onOpenChat(chat.id) : navigate(`/chat/${chat.id}`)
              }
            >
              <div className="chat-thread-title">{otherUser}</div>
              <div className="chat-thread-meta">
                <span>
                  {new Date(chat.lastActivityAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </button>
          );
        })}
      {chats.length === 0 && !loadingChats && (
        <div className="sidebar-empty">No chats yet.</div>
      )}

      <form className="thread-new-form" onSubmit={handleStartChat}>
        <label>
          Start chat with
          <select
            value={newChatUser}
            onChange={(e) => setNewChatUser(e.target.value)}
          >
            <option value="">Select user…</option>
            {availableUsers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="btn-primary btn-small"
          disabled={!newChatUser.trim()}
        >
          Start Chat
        </button>
      </form>

      {/* Threads Section */}
      <div className="chat-section-label" style={{ marginTop: '16px' }}>
        Threads
      </div>
      {loadingThreads && <div className="sidebar-empty">Loading threads…</div>}
      {!loadingThreads &&
        threads.map((t) => (
          <button
            key={t.id}
            type="button"
            className="chat-thread-item"
            onClick={() => navigate('/threads')}
          >
            <div className="chat-thread-title">{t.title}</div>
            <div className="chat-thread-meta">
              <span>{t.status === 'closed' ? 'Closed' : 'Open'}</span>
              <span>
                {new Date(t.lastActivityAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </button>
        ))}
      {threads.length === 0 && !loadingThreads && (
        <div className="sidebar-empty">No threads yet.</div>
      )}

      <form className="thread-new-form" onSubmit={handleCreateThread}>
        <label>
          New thread
          <input
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            placeholder="Start a new thread…"
          />
        </label>
        <button
          type="submit"
          className="btn-primary btn-small"
          disabled={!newThreadTitle.trim()}
        >
          Create
        </button>
      </form>
    </aside>
  );
};

export default ChatSidebar;

