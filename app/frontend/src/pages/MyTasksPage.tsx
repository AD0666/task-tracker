import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import TaskTable from '../components/TaskTable';
import { Task, fetchMyTasks } from '../api';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const { addTaskNotification } = useNotifications();
  const prevP1IdsRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  const loadTasks = () => {
    fetchMyTasks()
      .then((data) => {
        setTasks(data);
        setLastUpdated(new Date());
        const p1Open = data.filter(
          (t) => t.priority === 'P1' && t.status !== 'Done'
        );
        const currentIds = new Set(
          p1Open.map((t) => String(t._rowIndex ?? `${t.slNo}-${t.title}`))
        );
        const prevIds = prevP1IdsRef.current;
        p1Open.forEach((task) => {
          const id = String(task._rowIndex ?? `${task.slNo}-${task.title}`);
          if (!prevIds.has(id)) {
            addTaskNotification(task);
          }
        });
        prevP1IdsRef.current = currentIds;
      })
      .catch((err) => setError(err.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
    const interval = window.setInterval(loadTasks, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const p1OpenTasks = tasks.filter(
    (t) => t.priority === 'P1' && t.status !== 'Done'
  );
  const completedTasks = tasks.filter((t) => t.status === 'Done');
  const overdueTasks = tasks.filter((t) => t.isOverdue);

  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  );

  const applyFilters = (task: Task) => {
    if (statusFilter !== 'All' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && task.priority !== priorityFilter)
      return false;
    if (categoryFilter !== 'All' && task.category !== categoryFilter)
      return false;
    return true;
  };

  const filteredTasks = tasks.filter(applyFilters);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Task Tracker</h1>
          <p className="subtitle">
            Personalized homepage for your tasks. P1 tasks are highlighted in
            red; overdue tasks are flagged in the table.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary btn-small"
          onClick={() => navigate('/tasks/new')}
        >
          + New Task
        </button>
      </div>

      {!loading && !error && (
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-label">My Tasks</div>
            <div className="summary-value">{tasks.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">P1 Tasks</div>
            <div className="summary-value accent">{p1OpenTasks.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Overdue</div>
            <div className="summary-value warning">{overdueTasks.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Completed</div>
            <div className="summary-value success">
              {completedTasks.length}
            </div>
          </div>
        </div>
      )}

      {lastUpdated && (
        <div className="last-updated">
          Last refreshed at {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {loading && <div>Loading…</div>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <div className="filters-row">
              <div className="filter-group">
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Not Done">Not Done</option>
                  <option value="Discussed/WIP">Discussed/WIP</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="filter-group">
                <span>Priority</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
              </div>
              <div className="filter-group">
                <span>Category</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TaskTable
              tasks={filteredTasks}
              onEdit={(task) =>
                task._rowIndex && navigate(`/tasks/${task._rowIndex}`)
              }
            />
          </section>

          <aside className="dashboard-sidebar">
            <div className="sidebar-card">
              <h2>P1 Priority Tasks</h2>
              {p1OpenTasks.length === 0 && (
                <div className="sidebar-empty">No open P1 tasks 🎉</div>
              )}
              {p1OpenTasks.map((t) => (
                <div key={t._rowIndex ?? `${t.slNo}-${t.title}`} className="sidebar-task">
                  <div className="sidebar-task-title">{t.title}</div>
                  <div className="sidebar-task-meta">
                    <span>{t.date}</span>
                    <span>{t.category}</span>
                    <span>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sidebar-card">
              <h2>Task Categories</h2>
              {categories.length === 0 && (
                <div className="sidebar-empty">No categories yet.</div>
              )}
              {categories.map((c) => {
                const count = tasks.filter((t) => t.category === c).length;
                return (
                  <div key={c} className="sidebar-pill-row">
                    <span className="sidebar-pill-label">{c}</span>
                    <span className="sidebar-pill-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </Layout>
  );
};

export default MyTasksPage;

