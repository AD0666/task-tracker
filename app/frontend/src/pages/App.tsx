import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import LoginPage from './LoginPage';
import MyTasksPage from './MyTasksPage';
import TaskDetailPage from './TaskDetailPage';
import CreateTaskPage from './CreateTaskPage';
import ThreadsPage from './ThreadsPage';
import ChatPage from './ChatPage';
import ToastContainer from '../components/ToastContainer';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppShell: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MyTasksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <PrivateRoute>
              <MyTasksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/threads"
          element={
            <PrivateRoute>
              <ThreadsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
      <Route
        path="/tasks/new"
        element={
          <PrivateRoute>
            <CreateTaskPage />
          </PrivateRoute>
        }
      />
        <Route
          path="/tasks/:rowIndex"
          element={
            <PrivateRoute>
              <TaskDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <NotificationProvider>
      <AppShell />
    </NotificationProvider>
  </AuthProvider>
);

export default App;

