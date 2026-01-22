import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Task, fetchMyTasks, updateTask } from '../api';
import { useNotifications } from '../context/NotificationContext';

const TaskDetailPage: React.FC = () => {
  const { rowIndex } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!rowIndex) {
        setError('Missing task id');
        setLoading(false);
        return;
      }
      try {
        const myTasks = await fetchMyTasks();
        const found = myTasks.find(
          (t) => t._rowIndex === Number(rowIndex)
        );
        if (!found) {
          setError('Task not found or not owned by you');
        } else {
          setTask(found);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rowIndex]);

  const handleChange = (field: keyof Task, value: string) => {
    if (!task) return;
    setTask({ ...task, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !rowIndex) return;
    setSaving(true);
    setError(null);
    try {
      await updateTask(Number(rowIndex), {
        title: task.title,
        comments: task.comments,
        priority: task.priority,
        status: task.status,
        noOfDays: task.noOfDays
      });
      addToast('Task updated successfully', 'success');
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h1>Edit Task</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && task && (
        <form className="form-vertical" onSubmit={handleSave}>
          <label>
            Title
            <input
              value={task.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </label>
          <label>
            Comments
            <input
              value={task.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
            />
          </label>
          <label>
            Priority
            <select
              value={task.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={task.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="Not Done">Not Done</option>
              <option value="Discussed/WIP">Discussed/WIP</option>
              <option value="Done">Done</option>
            </select>
          </label>
          <label>
            Days
            <input
              type="number"
              value={task.noOfDays}
              onChange={(e) => handleChange('noOfDays', e.target.value)}
            />
          </label>
          <div className="detail-meta-row">
            <span>Owner: {task.owner}</span>
            <span>Category: {task.category}</span>
          </div>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </Layout>
  );
};

export default TaskDetailPage;

