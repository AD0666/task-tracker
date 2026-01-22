import React, { createContext, useContext, useState } from 'react';
import type { Task } from '../api';

export type NotificationType = 'info' | 'warning' | 'success';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
  task?: Task;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  toasts: AppNotification[];
  addTaskNotification: (task: Task) => void;
  addToast: (message: string, type?: NotificationType) => void;
  clearNotifications: () => void;
  dismissToast: (id: string) => void;
  toggleCenter: () => void;
  centerOpen: boolean;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [centerOpen, setCenterOpen] = useState(false);

  const addNotificationInternal = (
    message: string,
    type: NotificationType,
    task?: Task
  ) => {
    const n: AppNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      message,
      createdAt: new Date(),
      task
    };
    setNotifications((prev) => [n, ...prev].slice(0, 50));
    setToasts((prev) => [n, ...prev]);
  };

  const addTaskNotification = (task: Task) => {
    const message = `New P1 task assigned: ${task.title}`;
    addNotificationInternal(message, 'warning', task);
  };

  const addToast = (message: string, type: NotificationType = 'info') => {
    addNotificationInternal(message, type);
  };

  const clearNotifications = () => setNotifications([]);

  const dismissToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const toggleCenter = () => setCenterOpen((open) => !open);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        addTaskNotification,
        addToast,
        clearNotifications,
        dismissToast,
        toggleCenter,
        centerOpen
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }
  return ctx;
}

