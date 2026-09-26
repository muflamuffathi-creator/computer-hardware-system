import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const lastReceipt = (() => {
    try {
      return JSON.parse(localStorage.getItem('lastReceipt') || 'null');
    } catch (e) {
      return null;
    }
  })();

  const id = lastReceipt?.orderId || lastReceipt?.id || lastReceipt?.order_id;
  const amount = lastReceipt?.totalAmount ?? lastReceipt?.amount ?? lastReceipt?.total;

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard. From here you can view recent orders, saved builds, and account settings.</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/orders" className="btn-primary">My Orders</Link>
        <Link to="/builds" className="btn-secondary">Saved Builds</Link>
        <Link to="/profile" className="btn-secondary">Account Settings</Link>
      </div>

      {lastReceipt && (
        <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem', maxWidth: '720px' }}>
          <h3>Latest Order</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>Order ID</div>
            <div><strong>#{id}</strong></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>Amount</div>
            <div><strong>Rs. {Number(amount ?? 0).toFixed(2)}</strong></div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/receipt" className="btn-primary">View Receipt</Link>
          </div>
        </div>
      )}
    </div>
  );
}
