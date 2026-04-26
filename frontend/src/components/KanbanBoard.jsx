import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const STATUS_COLUMNS = ['OPEN', 'IN_PROGRESS', 'DELAYED', 'COMPLETED'];

export default function KanbanBoard({ tasks, fetchTasks, user, baseUrl, members = [], deleteTask }) {
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const updateStatus = async (taskId, newStatus) => {
    try {
      await fetch(`${baseUrl}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch(e) {
      console.error(e);
    }
  };

  const assignToUser = async (taskId, assigneeId) => {
    console.log("Assigning task", taskId, "to", assigneeId);
    try {
      await fetch(`${baseUrl}/tasks/${taskId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      });
      fetchTasks();
    } catch(e) {
      console.error("Assignment failed", e);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesAssignee = assigneeFilter === 'ALL' || t.assigneeId === assigneeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesAssignee && matchesStatus;
  });

  const activeColumns = statusFilter === 'ALL' ? STATUS_COLUMNS : [statusFilter];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Owner:</span>
          <select className="input-field" style={{ margin: 0, padding: '8px 12px', width: 'auto' }} 
                  value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
            <option value="ALL">All Members</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.username} {m.id === user.id ? '(Me)' : ''}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>View Status:</span>
          <select className="input-field" style={{ margin: 0, padding: '8px 12px', width: 'auto' }} 
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Stages</option>
            {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        {(assigneeFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--primary)' }} onClick={() => { setAssigneeFilter('ALL'); setStatusFilter('ALL'); }}>
            Reset Filters
          </button>
        )}
      </div>

      {/* Kanban Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeColumns.length}, minmax(300px, 1fr))`, gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        {activeColumns.map(status => {
          const colTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div key={status} className="glass-panel" style={{ padding: '20px', minHeight: '500px', display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
              <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{status.replace('_', ' ')}</span>
                <span style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '99px', color: 'var(--text-muted)' }}>{colTasks.length}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.5 }}>
                    <p style={{ fontSize: '0.9rem' }}>No tasks found</p>
                  </div>
                )}
                {colTasks.map(task => (
                  <div key={task.id} className="glass-panel animate-fade-in" style={{ padding: '16px', background: 'white', borderTop: `4px solid ${status === 'OPEN' ? 'var(--status-open)' : (status === 'IN_PROGRESS' || status === 'DELAYED' ? 'var(--status-in)' : 'var(--status-completed)')}` }}>
                    <h4 style={{ marginBottom: '8px' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{task.description}</p>
                    
                    <div style={{ fontSize: '0.75rem', display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>Severity: {task.severity || 'LOW'}</span>
                      {task.deadline && <span style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>Due: {task.deadline}</span>}
                      {task.assigneeId && (
                        <span style={{ background: task.assigneeId === user.id ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0,0,0,0.05)', color: task.assigneeId === user.id ? 'var(--primary)' : 'var(--text-main)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {members.find(m => m.id === task.assigneeId)?.username || 'Assigned'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                       {status !== 'COMPLETED' && (
                          <select className="input-field" style={{ padding: '6px', margin: 0, width: 'auto', flex: 1, fontSize: '0.85rem' }}
                                  value={status} onChange={(e) => updateStatus(task.id, e.target.value)}>
                            {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                          </select>
                       )}
                       
                       <div style={{ display: 'flex', gap: '4px', flex: 1, alignItems: 'center' }}>
                          <select className="input-field" style={{ padding: '6px', margin: 0, fontSize: '0.8rem', background: '#f8fafc', flex: 1 }}
                                  value={task.assigneeId || ''} onChange={(e) => assignToUser(task.id, e.target.value)}>
                            <option value="">Unassigned</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.username} {m.id === user.id ? '(Me)' : ''}
                              </option>
                            ))}
                          </select>
                          {task.assigneeId !== user.id && (
                            <button className="btn-outline" style={{ padding: '6px', fontSize: '0.7rem' }} onClick={() => assignToUser(task.id, user.id)}>
                              Assign Me
                            </button>
                          )}
                       </div>

                       <button className="btn-outline" 
                               style={{ padding: '8px', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                               title="Delete task"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 deleteTask(task.id);
                               }}>
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
