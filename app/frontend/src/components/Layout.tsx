import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ChatSidebar from './ChatSidebar';
import ChatBanner from './ChatBanner';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const isActive = (path: string) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">Task Tracker</div>
        <nav className="nav">
          <Link className={isActive('/')} to="/">
            My Tasks
          </Link>
          <Link className={isActive('/threads')} to="/threads">
            Threads
          </Link>
        </nav>
        <div className="user-info">
          <NotificationCenter />
          <span className="user-chip">
            {user?.username} <span className="role-chip">{user?.role}</span>
          </span>
          <button className="btn-text" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <div className="app-body">
        <ChatSidebar onOpenChat={setActiveChatId} />
        <main className="app-main">{children}</main>
        <ChatBanner chatId={activeChatId} onClose={() => setActiveChatId(null)} />
      </div>
    </div>
  );
};

export default Layout;

