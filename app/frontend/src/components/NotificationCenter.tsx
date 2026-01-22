import React from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationCenter: React.FC = () => {
  const { notifications, centerOpen, toggleCenter, clearNotifications } =
    useNotifications();

  const unreadCount = notifications.length;

  return (
    <div className="notification-center">
      <button
        className="bell-button"
        type="button"
        onClick={toggleCenter}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      {centerOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button
                className="btn-text small"
                type="button"
                onClick={clearNotifications}
              >
                Clear
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 && (
              <div className="notification-empty">No notifications yet.</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="notification-item">
                <div className="notification-title">{n.message}</div>
                <div className="notification-meta">
                  {n.task?.title && <span>{n.task.title}</span>}
                  <span>
                    {n.createdAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

