import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Task, createTask } from '../api';
import { useNotifications } from '../context/NotificationContext';

const todayISO = new Date().toISOString().slice(0, 10);

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [form, setForm] = useState<Partial<Task>>({
    title: '',
    date: todayISO,
    description: '',
    comments: '',
    collaborators: '',
    priority: 'P2',
    category: '',
    status: 'Not Done',
    noOfDays: '0'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      setError('Title is required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload: Partial<Task> = {
        slNo: '',
        ...form
      };
      await createTask(payload);
      addToast(`Task "${form.title}" created`, 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1>New Task</h1>
      <p className="subtitle">
        Create a new task assigned to you. You can always edit it later.
      </p>
      <form onSubmit={handleSubmit} className="form-vertical">
        <label>
          Title
          <input
            name="title"
            value={form.title ?? ''}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={form.date ?? todayISO}
            onChange={onChange}
          />
        </label>
        <label>
          Category
          <input
            name="category"
            value={form.category ?? ''}
            onChange={onChange}
          />
        </label>
        <label>
          Priority
          <select
            name="priority"
            value={form.priority ?? 'P2'}
            onChange={onChange}
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
        </label>
        <label>
          Status
          <select
            name="status"
            value={form.status ?? 'Not Done'}
            onChange={onChange}
          >
            <option value="Not Done">Not Done</option>
            <option value="Discussed/WIP">Discussed/WIP</option>
            <option value="Done">Done</option>
          </select>
        </label>
        <label>
          No of days
          <input
            type="number"
            name="noOfDays"
            value={form.noOfDays ?? '0'}
            min="0"
            onChange={onChange}
          />
        </label>
        <label>
          Collaborators
          <input
            name="collaborators"
            value={form.collaborators ?? ''}
            onChange={onChange}
          />
        </label>
        <label>
          Comments
          <input
            name="comments"
            value={form.comments ?? ''}
            onChange={onChange}
          />
        </label>
        {error && <div className="error-banner">{error}</div>}
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Task'}
        </button>
      </form>
    </Layout>
  );
};

export default CreateTaskPage;

