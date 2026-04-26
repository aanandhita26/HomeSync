import { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, CheckSquare, Bell, Copy, Plus, Users, Home, X, CheckCircle, AlertCircle } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard.jsx';
import TaskCreator from '../components/TaskCreator.jsx';
import CustomAlert from '../components/CustomAlert.jsx';
import CustomModal from '../components/CustomModal.jsx';

export default function Dashboard({ user, setUser, activeHouseholdId, setActiveHouseholdId }) {
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban');
  const [joinCode, setJoinCode] = useState('');
  const [notify, setNotify] = useState(null);
  const [modal, setModal] = useState(null); // { title, message, onConfirm }

  const baseUrl = 'http://localhost:8080/api';

  const showToast = (message, type = 'info') => {
    setNotify({ message, type });
  };

  useEffect(() => {
    fetchHouseholds();
    fetchReminders();
    const intv = setInterval(() => { fetchTasks(); fetchReminders(); }, 15000);
    return () => clearInterval(intv);
  }, []);

  useEffect(() => {
    if (activeHouseholdId) {
      fetchTasks();
      fetchMembers();
    }
  }, [activeHouseholdId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/household/${activeHouseholdId}/members`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch (e) {
      console.error("Failed to fetch members", e);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/user/households/${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setHouseholds(data);
        if (data.length > 0 && !activeHouseholdId) {
          setActiveHouseholdId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch households", e);
    }
  };

  const fetchTasks = async () => {
    if (!activeHouseholdId) return;
    try {
      const res = await fetch(`${baseUrl}/tasks/household/${activeHouseholdId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${baseUrl}/reminders/${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setReminders(data);
    } catch (e) {
      console.error("Failed to fetch reminders", e);
    }
  };

  const handleCreateHousehold = async () => {
    const name = prompt("Enter Household Name:");
    if (!name) return;
    try {
      const res = await fetch(`${baseUrl}/auth/household`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: user.id })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Server error occurred");
      }
      const data = await res.json();
      fetchHouseholds();
      showToast(`Household "${data.name}" created!`, 'success');
    } catch (err) {
      console.error("Create household failed:", err);
      showToast("Failed to create household: " + err.message, 'error');
    }
  };

  const handleJoinHousehold = async () => {
    if (!joinCode) return;
    try {
      const res = await fetch(`${baseUrl}/auth/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode, userId: user.id })
      });
      if (!res.ok) throw new Error(await res.text());
      setJoinCode('');
      fetchHouseholds();
      showToast("Joined successfully!", 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyInviteCode = () => {
    const activeH = households.find(h => h.id === activeHouseholdId);
    if (activeH) {
      navigator.clipboard.writeText(activeH.inviteCode);
      showToast("Invite code copied to clipboard!", 'success');
    }
  };

  const handleLeaveHousehold = async () => {
    const activeH = households.find(h => h.id === activeHouseholdId);
    if (!activeH) return;
    
    setModal({
      title: "Leave Household",
      message: `Are you sure you want to leave ${activeH.name}? You will need an invite code to join back.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/auth/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, householdId: activeHouseholdId })
          });
          if (!res.ok) throw new Error("Failed to leave household");

          showToast(`Left ${activeH.name}`, 'info');
          setActiveHouseholdId(null);
          fetchHouseholds();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setModal(null);
        }
      }
    });
  };

  const activeHousehold = Array.isArray(households) ? households.find(h => h.id === activeHouseholdId) : null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stopRecurrence = async (taskId) => {
    try {
      await fetch(`${baseUrl}/tasks/${taskId}/stop-recurrence`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchTasks();
      showToast("Recurrence stopped!", 'info');
    } catch (e) {
      console.error(e);
      showToast("Failed to stop recurrence", "error");
    }
  };

  const deleteTask = async (taskId) => {
    setModal({
      title: "Delete Task",
      message: "This action cannot be undone. Are you sure you want to delete this chore permanently?",
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/tasks/${taskId}`, { method: 'DELETE' });
          if (res.ok) {
            showToast("Task deleted", 'info');
            fetchTasks();
          }
        } catch (e) {
          console.error("Delete failed:", e);
          showToast("Delete failed", 'error');
        } finally {
          setModal(null);
        }
      }
    });
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {notify && <CustomAlert message={notify.message} type={notify.type} onClose={() => setNotify(null)} />}
      {modal && <CustomModal title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>{today}</p>
          <h2>Welcome, <span className="gradient-text">{user.username}</span></h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Active: <strong>{activeHousehold?.name || 'None'}</strong>
            </p>
            {activeHousehold && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={copyInviteCode} className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Copy size={14} /> {activeHousehold.inviteCode}
                </button>
                <button onClick={handleLeaveHousehold} className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--status-delayed)', borderColor: 'var(--status-delayed)' }}>
                  Leave
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {reminders.length > 0 && (
            <div style={{ position: 'relative', color: 'var(--status-delayed)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '999px' }}>
              <Bell size={18} />
              <span style={{ fontWeight: 600 }}>{reminders.length} Alerts</span>
            </div>
          )}
          <button className="btn-outline" onClick={() => setUser(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Household Switcher */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> My Households</h3>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {households.map(h => (
            <div key={h.id}
              onClick={() => setActiveHouseholdId(h.id)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                padding: '16px',
                borderRadius: '12px',
                background: activeHouseholdId === h.id ? 'rgba(251, 113, 133, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: activeHouseholdId === h.id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: '0.3s',
                minWidth: '120px'
              }}>
              <Home size={32} color={activeHouseholdId === h.id ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</p>
            </div>
          ))}
          <div onClick={handleCreateHousehold}
            style={{
              cursor: 'pointer', textAlign: 'center', padding: '16px', borderRadius: '12px', border: '2px dashed var(--glass-border)', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
            <Plus size={32} color="var(--text-muted)" />
            <p style={{ fontSize: '0.9rem' }}>New</p>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', maxWidth: '400px' }}>
          <input className="input-field" placeholder="Join with code..." value={joinCode} onChange={e => setJoinCode(e.target.value)} style={{ margin: 0 }} />
          <button className="btn-primary" onClick={handleJoinHousehold}>Join</button>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <button className={activeTab === 'kanban' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('kanban')}>
          <LayoutDashboard size={18} /> Chore Board
        </button>
        <button className={activeTab === 'members' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('members')} disabled={!activeHouseholdId}>
          <Users size={18} /> Members
        </button>
        <button className={activeTab === 'create' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('create')} disabled={!activeHouseholdId}>
          <CheckSquare size={18} /> Create Task
        </button>
        <button className={activeTab === 'recurring' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('recurring')} disabled={!activeHouseholdId}>
          <CheckSquare size={18} /> Recurring Tasks
        </button>
      </div>

      <main className="animate-fade-in">
        {!activeHouseholdId && <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Please select or join a household to see tasks.</div>}
        {activeTab === 'kanban' && activeHouseholdId && <KanbanBoard tasks={tasks} fetchTasks={fetchTasks} user={user} baseUrl={baseUrl} members={members} deleteTask={deleteTask} />}
        {activeTab === 'members' && activeHouseholdId && (
          <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={24} color="var(--primary)" /> Members of {activeHousehold?.name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {members.map(m => (
                <div key={m.id} className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: m.id === user.id ? 'rgba(244, 63, 94, 0.05)' : 'white', border: m.id === user.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.2rem', fontWeight: 600 }}>
                    {m.username[0].toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{m.username} {m.id === user.id ? '(You)' : ''}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.id === user.id ? 'Active User' : 'Household Member'}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Share the invite code to add more members:</p>
              <button onClick={copyInviteCode} className="btn-primary" style={{ padding: '10px 20px', fontSize: '1.1rem' }}>
                <Copy size={18} /> {activeHousehold?.inviteCode}
              </button>
            </div>
          </div>
        )}
        {activeTab === 'create' && activeHouseholdId && <TaskCreator fetchTasks={fetchTasks} user={{ ...user, householdId: activeHouseholdId }} baseUrl={baseUrl} onBack={() => setActiveTab('kanban')} showToast={showToast} />}
        {activeTab === 'recurring' && activeHouseholdId && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px' }}>Recurring Chores Management</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.filter(t => t.recurring).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recurring tasks configured.</p>}
              {tasks.filter(t => t.recurring).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Frequency: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{task.recurrenceFrequency}</span></p>
                  </div>
                  <button className="btn-outline" style={{ borderColor: 'var(--status-delayed)', color: 'var(--status-delayed)', padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => stopRecurrence(task.id)}>
                    Stop Recurrence
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
