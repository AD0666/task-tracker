import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TaskTable from '../components/TaskTable';
import { Task, fetchAllTasks } from '../api';

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTasks()
      .then(setTasks)
      .catch((err) => setError(err.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1>Dashboard</h1>
      <p className="subtitle">
        Overview of all tasks. P1 tasks are highlighted in red; overdue tasks
        are shaded.
      </p>
      {loading && <div>Loading…</div>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && !error && <TaskTable tasks={tasks} />}
    </Layout>
  );
};

export default DashboardPage;

