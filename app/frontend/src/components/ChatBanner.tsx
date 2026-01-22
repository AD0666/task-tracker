import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PersonalChat,
  ChatMessage,
  getChatById,
  getChatMessages,
  addChatMessage,
  getOtherParticipant
} from '../services/personalChats';

interface Props {
  chatId: string | null;
  onClose: () => void;
}

const ChatBanner: React.FC<Props> = ({ chatId, onClose }) => {
  const { user } = useAuth();
  const [chat, setChat] = useState<PersonalChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!chatId || !user?.username) {
        setChat(null);
        setMessages([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const chatData = await getChatById(chatId);
        if (!chatData) {
          setError('Chat not found');
          setChat(null);
          setMessages([]);
          return;
        }
        const isParticipant =
          chatData.participant1.toLowerCase() === user.username.toLowerCase() ||
          chatData.participant2.toLowerCase() === user.username.toLowerCase();
        if (!isParticipant) {
          setError('You do not have access to this chat');
          setChat(null);
          setMessages([]);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !newMessage.trim() || !user?.username) return;
    try {
      const { message } = await addChatMessage(chatId, user.username, newMessage);
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    }
  };

  if (!chatId) return null;

  const otherUser =
    chat && user?.username ? getOtherParticipant(chat, user.username) : '';

  return (
    <div className="chat-banner">
      <div className="chat-banner-header">
        <div className="chat-banner-title">
          <span className="chat-banner-name">
            {otherUser || 'Chat'}
          </span>
          {chat && (
            <span className="chat-banner-sub">
              Started {new Date(chat.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-text small"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="chat-banner-body">
        {loading && <div className="sidebar-empty">Loading chat…</div>}
        {error && <div className="error-banner">{error}</div>}
        {!loading && !error && (
          <>
            <div className="chat-banner-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    'thread-item' +
                    (m.author.toLowerCase() === user?.username?.toLowerCase()
                      ? ' thread-item-own'
                      : '')
                  }
                >
                  <div className="thread-meta">
                    <span className="thread-author">{m.author}</span>
                    <span className="thread-time">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="thread-message">{m.body}</div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="sidebar-empty">
                  No messages yet. Start the conversation.
                </div>
              )}
            </div>
            <form className="chat-banner-input" onSubmit={handleSend}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
              />
              <button
                type="submit"
                className="btn-primary btn-small"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBanner;

