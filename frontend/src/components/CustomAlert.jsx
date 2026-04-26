import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function CustomAlert({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: <CheckCircle size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    error: { icon: <AlertCircle size={20} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    info: { icon: <Info size={20} />, color: 'var(--primary)', bg: 'rgba(251, 113, 133, 0.1)' }
  };

  const { icon, color, bg } = config[type] || config.info;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      minWidth: '320px',
      padding: '16px 20px',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: `1px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideDown 0.3s ease-out forwards'
    }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
        {message}
      </div>
      <button 
        onClick={onClose}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          padding: '4px',
          display: 'flex'
        }}
      >
        <X size={18} />
      </button>

      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
