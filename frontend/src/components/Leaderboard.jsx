import { useState, useEffect } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';

export default function Leaderboard({ activeHouseholdId, baseUrl }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/tasks/household/${activeHouseholdId}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeHouseholdId) {
      fetchLeaderboard();
    }
  }, [activeHouseholdId, baseUrl]);

  if (loading) {
    return <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading Leaderboard...</div>;
  }

  if (leaderboard.length === 0) {
    return <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>No tasks completed yet. Complete chores to earn points!</div>;
  }

  const maxPoints = Math.max(...leaderboard.map(u => u.points), 1);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '8px' }}>
          <Trophy size={28} color="#fbbf24" /> Household Leaderboard
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>Complete chores to earn points: LOW (10), MEDIUM (20), HIGH (30)</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {leaderboard.map((user, index) => {
          let Icon = Star;
          let iconColor = 'var(--text-muted)';
          
          if (index === 0) {
            Icon = Trophy;
            iconColor = '#fbbf24'; // Gold
          } else if (index === 1) {
            Icon = Medal;
            iconColor = '#94a3b8'; // Silver
          } else if (index === 2) {
            Icon = Medal;
            iconColor = '#b45309'; // Bronze
          }

          const progressPercent = Math.min((user.points / maxPoints) * 100, 100);

          return (
            <div key={user.userId} style={{ background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: iconColor, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {index + 1}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{user.username}</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {user.points} pts <Icon size={18} color={iconColor} fill={index === 0 ? iconColor : 'none'} />
                </div>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
