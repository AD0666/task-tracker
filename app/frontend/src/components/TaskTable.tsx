import React from 'react';
import { Task } from '../api';

interface Props {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onSelect?: (task: Task) => void;
}

const TaskTable: React.FC<Props> = ({ tasks, onEdit, onSelect }) => {
  return (
    <div className="table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Date</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Collaborators</th>
            <th>Priority</th>
            <th>Category</th>
            <th>Status</th>
            <th>Days</th>
            {onEdit && <th />}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const p1 = t.priority === 'P1';
            const overdue = t.isOverdue;
            const rowClass = [
              p1 ? 'row-p1' : '',
              overdue ? 'row-overdue' : ''
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <tr
                key={t._rowIndex ?? `${t.slNo}-${t.title}`}
                className={rowClass}
                onClick={() => onSelect && onSelect(t)}
              >
                <td>{t.slNo}</td>
                <td>{t.date}</td>
                <td>{t.title}</td>
                <td>
                  <span className="owner-pill">{t.owner}</span>
                </td>
                <td>{t.collaborators}</td>
                <td>
                  <span className={`priority-pill priority-${t.priority}`}>
                    {t.priority}
                  </span>
                </td>
                <td>{t.category}</td>
                <td>{t.status}</td>
                <td>{t.noOfDays}</td>
                {onEdit && (
                  <td>
                    <button
                      type="button"
                      className="btn-text small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(t);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={onEdit ? 10 : 9} className="empty-state">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;

