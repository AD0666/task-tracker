import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismissToast(t.id), 5000)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

