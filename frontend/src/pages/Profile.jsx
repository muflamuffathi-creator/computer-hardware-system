import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    const name = localStorage.getItem('user_name') || '';
    const email = localStorage.getItem('email') || '';
    const role = localStorage.getItem('role') || '';
    setUser({ name, email, role });
  }, []);

  return (
    <div className="page profile-page">
      <h1>Account Profile</h1>
      <div className="glass-panel" style={{ maxWidth: '720px', padding: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Name</div>
            <div style={{ fontWeight: 700 }}>{user.name || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Email</div>
            <div style={{ fontWeight: 700 }}>{user.email || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Role</div>
            <div style={{ fontWeight: 700 }}>{user.role || 'Customer'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
