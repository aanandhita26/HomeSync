import { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function TaskCreator({ fetchTasks, user, baseUrl, onBack, showToast }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('DAILY');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline, severity, isRecurring, recurrenceFrequency, householdId: user.householdId })
      });
      if (!res.ok) throw new Error("Failed to create task");
      
      if (showToast) showToast("Task created successfully!", 'success');
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
          body: JSON.stringify({ title: st, description: `Part of: ${title || description}`, deadline, severity, isRecurring, recurrenceFrequency, householdId: user.householdId })
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
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Task Title</label>
          <input className="input-field" type="text" placeholder="e.g. Fix wall clock" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Description (What needs to be done?)</label>
          <textarea className="input-field" placeholder="Provide extra details for the AI..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          
          <button type="button" onClick={handleAiBreakdown} disabled={aiLoading} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary)', padding: '12px', marginTop: '8px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isRecurring ? '16px' : '0' }}>
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="recurring" style={{ cursor: 'pointer', color: 'var(--text-main)', fontWeight: 500 }}>Is it a recurring chore?</label>
          </div>
          
          {isRecurring && (
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
