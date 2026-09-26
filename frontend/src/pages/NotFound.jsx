import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '1.5rem', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '520px' }}>
        <h1 className="display-title" style={{ fontSize: '2.5rem' }}>404</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>
          The page you are looking for does not exist. Head back to the storefront and continue shopping.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <ArrowLeft size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
}
