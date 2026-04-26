// src/pages/Landing.jsx
import { useState } from 'react';
import { Sparkles, Users, Key } from 'lucide-react';
import CustomAlert from '../components/CustomAlert.jsx';

export default function Landing({ setUser }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [notify, setNotify] = useState(null);

  const baseUrl = 'http://localhost:8080/api';

  const showToast = (message, type = 'info') => {
    setNotify({ message, type });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setNotify(null);
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const body = isRegistering ? { username, password, inviteCode } : { username, password };
    
    try {
      const res = await fetch(baseUrl + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text() || 'Authentication failed');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      {notify && <CustomAlert message={notify.message} type={notify.type} onClose={() => setNotify(null)} />}
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Sparkles size={40} color="var(--primary)" /> SheCircle Chores
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Elegant Household Management</p>
      </div>

      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
          {isRegistering ? 'Join a Household' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleAuth}>
          <input className="input-field" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {isRegistering && (
             <input className="input-field" type="text" placeholder="Invite Code (Optional)" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isRegistering ? <Users size={18} /> : <Key size={18} />}
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : 'New user? Register to join an existing household'}
          </p>
        </div>
      </div>
    </div>
  );
}
