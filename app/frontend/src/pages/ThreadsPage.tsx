import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  GlobalThread,
  GlobalMessage,
  listThreads,
  createThread,
  getThreadById,
  getMessages,
  addMessage
} from '../services/globalThreads';

const KNOWN_USERS = ['Damon', 'Miki', 'James', 'Anup', 'admin'];

const ThreadsPage: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<GlobalThread[]>([]);
  const [selected, setSelected] = useState<GlobalThread | null>(null);
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyFor, setReplyFor] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingThreads(true);
      setError(null);
      try {
        const data = await listThreads();
        setThreads(data);
        if (!selected && data.length > 0) {
          setSelected(data[0]);
        } else if (selected) {
          const fresh = data.find((t) => t.id === selected.id);
          if (fresh) setSelected(fresh);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load threads');
      } finally {
        setLoadingThreads(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selected) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      setError(null);
      try {
        const msgs = await getMessages(selected.id);
        setMessages(msgs);
        const fresh = await getThreadById(selected.id);
        if (fresh) {
          setSelected(fresh);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selected?.id]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;
    try {
      const author = user?.username || 'Anonymous';
      const thread = await createThread(newThreadTitle.trim(), author);
      const updated = await listThreads();
      setThreads(updated);
      setSelected(thread);
      setNewThreadTitle('');
    } catch (e: any) {
      setError(e.message || 'Failed to create thread');
    }
  };

  const handleSendMessage = async (parentId?: string) => {
    if (!selected || !newMessage.trim()) return;
    try {
      const author = user?.username || 'Anonymous';
      const { thread, message } = await addMessage(
        selected.id,
        author,
        newMessage,
        parentId
      );
      setSelected(thread);
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    }
  };

  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(\@\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        const name = part.slice(1);
        if (KNOWN_USERS.includes(name)) {
          return (
            <span key={idx} className="mention">
              {part}
            </span>
          );
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const isThreadClosed = selected?.status === 'closed';

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Team Threads</h1>
          <p className="subtitle">
            Global threaded conversations, similar to Microsoft Teams. Threads
            auto-close after 30 days of inactivity.
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="threads-layout">
        <aside className="threads-list">
          <div className="threads-list-header">
            <span>Threads</span>
          </div>
          <form className="thread-new-form" onSubmit={handleCreateThread}>
            <label>
              New thread title
              <input
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="e.g., Launch planning"
              />
            </label>
            <button
              type="submit"
              className="btn-primary btn-small"
              disabled={!newThreadTitle.trim()}
            >
              Create Thread
            </button>
          </form>
          {loadingThreads && <div>Loading threads…</div>}
          {!loadingThreads &&
            threads.map((t) => (
              <button
                key={t.id}
                type="button"
                className={
                  selected?.id === t.id
                    ? 'thread-list-item active'
                    : 'thread-list-item'
                }
                onClick={() => setSelected(t)}
              >
                <div className="thread-list-title">{t.title}</div>
                <div className="thread-list-meta">
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
            <div className="sidebar-empty">
              No threads yet. Start a new conversation.
            </div>
          )}
        </aside>

        <section className="threads-conversation">
          {!selected && (
            <div className="sidebar-empty">
              Select a thread or create a new one to start chatting.
            </div>
          )}
          {selected && (
            <>
              <div className="threads-conversation-header">
                <div>
                  <h2>{selected.title}</h2>
                  <p className="subtitle">
                    Started by {selected.createdBy} on{' '}
                    {new Date(selected.createdAt).toLocaleDateString()}
                    {selected.status === 'closed'
                      ? ' • This thread is closed after inactivity.'
                      : ''}
                  </p>
                </div>
              </div>
              {loadingMessages && <div>Loading messages…</div>}
              <div className="thread-list">
                {messages
                  .filter((m) => !m.parentId)
                  .map((m) => (
                    <div key={m.id} className="thread-item">
                      <div className="thread-meta">
                        <span className="thread-author">{m.author}</span>
                        <span className="thread-time">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="thread-message">
                        {renderTextWithMentions(m.body)}
                      </div>
                      {messages
                        .filter((r) => r.parentId === m.id)
                        .map((r) => (
                          <div key={r.id} className="thread-reply">
                            <div className="thread-meta">
                              <span className="thread-author">
                                {r.author}
                              </span>
                              <span className="thread-time">
                                {new Date(r.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="thread-message">
                              {renderTextWithMentions(r.body)}
                            </div>
                          </div>
                        ))}
                      {!isThreadClosed && (
                        <button
                          type="button"
                          className="btn-text thread-reply-toggle"
                          onClick={() =>
                            setReplyFor((current) =>
                              current === m.id ? null : m.id
                            )
                          }
                        >
                          Reply
                        </button>
                      )}
                      {replyFor === m.id && !isThreadClosed && (
                        <form
                          className="thread-reply-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(m.id);
                          }}
                        >
                          <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Reply to this thread…"
                          />
                          <button
                            type="submit"
                            className="btn-primary btn-small"
                            disabled={!newMessage.trim()}
                          >
                            Send
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                {messages.length === 0 && !loadingMessages && (
                  <div className="sidebar-empty">
                    No messages yet. Start the conversation.
                  </div>
                )}
              </div>

              {!isThreadClosed && (
                <form
                  className="thread-new-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <label>
                    New message
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      placeholder="Type your message. Use @Damon, @Miki, etc. to mention people."
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn-primary btn-small"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </form>
              )}
              {isThreadClosed && (
                <div className="info-banner">
                  This thread was closed automatically after 30 days of
                  inactivity.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ThreadsPage;

