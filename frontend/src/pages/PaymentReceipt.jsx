import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function PaymentReceipt() {
  const location = useLocation();
  const receipt = location.state?.receipt || JSON.parse(localStorage.getItem('lastReceipt') || 'null');

  const printReceipt = () => {
    window.print();
  };

  if (!receipt) {
    return (
      <div className="page receipt-page">
        <h1>Payment Receipt</h1>
        <p>No receipt information available.</p>
        <Link to="/orders">View Orders</Link>
      </div>
    );
  }

  const id = receipt.orderId || receipt.id || receipt.order_id || 'N/A';
  const amount = receipt.totalAmount ?? receipt.amount ?? receipt.total ?? 0;
  const items = receipt.items || receipt.orderItems || receipt.cartItems || [];

  return (
    <div className="page receipt-page" style={{ padding: '1.5rem' }}>
      <div className="glass-panel" style={{ maxWidth: '720px', margin: '0 auto', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Payment Receipt</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={printReceipt}>Print</button>
            <Link to="/orders" className="btn-primary">Back to Orders</Link>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Order ID</div>
              <strong>#{id}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)' }}>Amount Paid</div>
              <strong style={{ color: 'var(--secondary)' }}>Rs. {Number(amount).toFixed(2)}</strong>
            </div>
          </div>

          <h3 style={{ marginTop: '1rem' }}>Items</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '0.5rem 0' }}>Item</th>
                <th style={{ padding: '0.5rem 0' }}>Qty</th>
                <th style={{ padding: '0.5rem 0' }}>Price</th>
                <th style={{ padding: '0.5rem 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const name = it.name || it.title || it.product?.name || 'Item';
                const qty = it.quantity ?? it.qty ?? 1;
                const price = it.price ?? it.unitPrice ?? it.product?.price ?? 0;
                return (
                  <tr key={idx}>
                    <td style={{ padding: '0.5rem 0' }}>{name}</td>
                    <td style={{ padding: '0.5rem 0' }}>{qty}</td>
                    <td style={{ padding: '0.5rem 0' }}>Rs. {Number(price).toFixed(2)}</td>
                    <td style={{ padding: '0.5rem 0' }}>Rs. {(Number(price) * qty).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
