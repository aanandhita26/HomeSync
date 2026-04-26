import { AlertCircle } from 'lucide-react';

export default function CustomModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(51, 65, 85, 0.2)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '90%',
        maxWidth: '440px',
        padding: '32px',
        background: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'rgba(251, 113, 133, 0.1)', 
          color: 'var(--primary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px' 
        }}>
          <AlertCircle size={32} />
        </div>
        
        <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>{title || 'Are you sure?'}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-outline" 
            style={{ flex: 1, padding: '12px' }} 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1, padding: '12px' }} 
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
