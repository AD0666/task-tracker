import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  PersonalChat,
  ChatMessage,
  getChatById,
  getChatMessages,
  addChatMessage,
  getOtherParticipant
} from '../services/personalChats';

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<PersonalChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!chatId || !user?.username) {
        setError('Missing chat ID or user');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const chatData = await getChatById(chatId);
        if (!chatData) {
          setError('Chat not found');
          setLoading(false);
          return;
        }
        // Verify user is a participant
        const isParticipant =
          chatData.participant1.toLowerCase() === user.username.toLowerCase() ||
          chatData.participant2.toLowerCase() === user.username.toLowerCase();
        if (!isParticipant) {
          setError('You do not have access to this chat');
          setLoading(false);
          return;
        }
        setChat(chatData);
        const msgs = await getChatMessages(chatId);
        setMessages(msgs);
      } catch (e: any) {
        setError(e.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chatId, user?.username]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !newMessage.trim() || !user?.username) return;
    try {
      const { message } = await addChatMessage(chatId, user.username, newMessage);
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      // Refresh chat to update lastActivityAt
      const updated = await getChatById(chatId);
      if (updated) setChat(updated);
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading chat…</div>
      </Layout>
    );
  }

  if (error || !chat) {
    return (
      <Layout>
        <div className="error-banner">{error || 'Chat not found'}</div>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </Layout>
    );
  }

  const otherUser = getOtherParticipant(chat, user?.username || '');

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Chat with {otherUser}</h1>
          <p className="subtitle">Personal conversation</p>
        </div>
      </div>

      <div className="threads-layout">
        <section className="threads-conversation" style={{ gridColumn: '1 / -1' }}>
          <div className="threads-conversation-header">
            <div>
              <h2>{otherUser}</h2>
              <p className="subtitle">
                Chat started on {new Date(chat.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="thread-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`thread-item ${
                  msg.author.toLowerCase() === user?.username?.toLowerCase()
                    ? 'thread-item-own'
                    : ''
                }`}
              >
                <div className="thread-meta">
                  <span className="thread-author">{msg.author}</span>
                  <span className="thread-time">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="thread-message">{msg.body}</div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="sidebar-empty">
                No messages yet. Start the conversation.
              </div>
            )}
          </div>

          <form className="thread-new-form" onSubmit={handleSendMessage}>
            <label>
              Type a message
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                placeholder="Type your message…"
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
        </section>
      </div>
    </Layout>
  );
};

export default ChatPage;
