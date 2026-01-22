import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TaskTable from '../components/TaskTable';
import { Task, fetchOverdueTasks } from '../api';

const OverdueTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverdueTasks()
      .then(setTasks)
      .catch((err) => setError(err.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1>Overdue Tasks</h1>
      <p className="subtitle">
        Tasks past their due date (based on Date + No of Days) and not done.
      </p>
      {loading && <div>Loading…</div>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && !error && <TaskTable tasks={tasks} />}
    </Layout>
  );
};

export default OverdueTasksPage;

