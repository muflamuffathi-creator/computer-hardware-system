import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter(x => x.id !== id));
    }, timeout);
  }, []);

  const value = { addToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ minWidth: 220, padding: '0.75rem 1rem', borderRadius: 10, background: t.type === 'danger' ? 'rgba(239,68,68,0.12)' : t.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${t.type === 'danger' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#6366f1'}`, color: '#fff', fontWeight: 600, boxShadow: 'var(--glass-shadow)' }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
