import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function TaskCreator({ fetchTasks, user, baseUrl, onBack, showToast }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('DAILY');
  const [aiLoading, setAiLoading] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, [user.householdId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/household/${user.householdId}/members`);
      if (res.ok) setMembers(await res.json());
    } catch (e) { console.error(e); }
  };

  const getDifficulty = (t) => {
    const title = t.toLowerCase();
    if (title.includes('deep clean') || title.includes('repair') || title.includes('mow')) return 8;
    if (title.includes('cook') || title.includes('grocery') || title.includes('vacuum')) return 5;
    if (title.includes('trash') || title.includes('dust') || title.includes('water')) return 2;
    return 4;
  };

  const difficulty = getDifficulty(title);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          deadline, 
          severity, 
          recurring, 
          recurrenceFrequency, 
          householdId: user.householdId,
          assigneeId: assigneeId || null // AI handles it if null
        })
      });
      if (!res.ok) throw new Error("Failed to create task");
      
      if (showToast) showToast(assigneeId ? "Task created!" : "Task created and AI-assigned!", 'success');
      fetchTasks();
      onBack();
    } catch(err) {
      console.error(err);
      if (showToast) showToast("Error: " + err.message, 'error');
    }
  };

  const handleAiBreakdown = async () => {
    if (!description && showToast) return showToast("Please enter a description to break down", 'info');
    setAiLoading(true);
    try {
      const res = await fetch(`${baseUrl}/ai/breakdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      if (!res.ok) throw new Error("AI Breakdown failed");
      const subtasks = await res.json();
      
      let count = 0;
      for (let st of subtasks) {
        const tr = await fetch(`${baseUrl}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: st, 
            description: `Part of: ${title || description}`, 
            deadline: deadline || new Date().toISOString().split('T')[0], 
            severity, 
            recurring: false, // AI breakdown tasks shouldn't be recurring by default
            householdId: user.householdId 
          })
        });
        if (tr.ok) count++;
      }
      if (showToast) showToast(`AI successfully created ${count} sub-tasks!`, 'success');
      fetchTasks();
      onBack();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("AI Error: " + err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '6px 12px', fontSize: '0.9rem' }} onClick={onBack}>
        <ArrowLeft size={16} /> Back to Board
      </button>

      <h2 style={{ marginBottom: '24px' }}>Create New Task</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <span>Task Title</span>
            {title && (
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                Estimated Difficulty: {difficulty}/10
              </span>
            )}
          </label>
          <input className="input-field" type="text" placeholder="e.g. Fix wall clock" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Assign to (Optional)</label>
          <select className="input-field" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
            <option value="">AI Auto-Dispatcher (Based on Fairness)</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.username}</option>
            ))}
          </select>
        </div>

        <div className="ai-glow" style={{ marginBottom: '16px', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Description (What needs to be done?)</label>
          <textarea className="input-field" placeholder="Provide extra details for the AI..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          
          <button type="button" onClick={handleAiBreakdown} disabled={aiLoading} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary)', padding: '12px', marginTop: '8px', position: 'relative', zIndex: 1 }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{aiLoading ? 'Breaking down...' : 'AI Magic: Auto-create subtasks from description'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Deadline</label>
            <input className="input-field" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Severity</label>
            <select className="input-field" value={severity} onChange={e => setSeverity(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High (Urgent)</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '32px', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: recurring ? '16px' : '0' }}>
            <input type="checkbox" id="recurring" checked={recurring} onChange={e => setRecurring(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="recurring" style={{ cursor: 'pointer', color: 'var(--text-main)', fontWeight: 500 }}>Is it a recurring chore?</label>
          </div>
          
          {recurring && (
            <div className="animate-fade-in" style={{ paddingLeft: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Frequency of recurrence</label>
              <select className="input-field" value={recurrenceFrequency} onChange={e => setRecurrenceFrequency(e.target.value)} style={{ margin: 0 }}>
                <option value="DAILY">Once every day</option>
                <option value="WEEKLY">Once every week</option>
                <option value="MONTHLY">Once every month</option>
              </select>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Task</button>
      </form>
    </div>
  );
}
