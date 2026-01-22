import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TaskTable from '../components/TaskTable';
import { Task, fetchP1Tasks } from '../api';

const P1TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchP1Tasks()
      .then(setTasks)
      .catch((err) => setError(err.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1>P1 Tasks</h1>
      <p className="subtitle">High priority tasks (P1). Highlighted in red.</p>
      {loading && <div>Loading…</div>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && !error && <TaskTable tasks={tasks} />}
    </Layout>
  );
};

export default P1TasksPage;

