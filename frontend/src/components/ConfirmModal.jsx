import React from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}} onClick={onCancel} />
      <div style={{zIndex:2001,background:'var(--bg-glass)',padding:'1.25rem',borderRadius:12,boxShadow:'var(--glass-shadow)',minWidth:320}} className="glass-card">
        <div style={{marginBottom:12,fontWeight:700}}>{message}</div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
