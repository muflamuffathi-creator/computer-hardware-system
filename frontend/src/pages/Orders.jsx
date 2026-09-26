import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, ChevronDown, ChevronUp, Clock, PackageCheck, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { saveRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast("Failed to load your orders history.", 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await ordersAPI.cancelOrder(orderId);
      addToast('Your order was cancelled successfully.', 'success');
      fetchOrders();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast(err.response?.data || 'Unable to cancel the order.', 'danger');
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <PackageCheck size={18} style={{ color: 'var(--success)' }} />;
      case 'PENDING':
        return <Clock size={18} style={{ color: 'var(--warning)' }} />;
      case 'PROCESSING':
        return <Clock size={18} style={{ color: 'var(--primary)' }} />;
      default:
        return <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'compat-success';
      case 'PENDING':
        return 'compat-warning';
      case 'PROCESSING':
        return 'compat-warning'; // Fallback style or yellow glow
      default:
        return 'compat-error';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--secondary)' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ClipboardList size={28} /> Purchase History
      </h1>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          You have not placed any orders yet. Visit our catalog to start shopping!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const isExpanded = expandedOrder === order.orderId;
            const dateStr = new Date(order.orderDate).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={order.orderId} className="glass-panel" style={{ overflow: 'hidden' }}>
                
                {/* Header card summary */}
                <div 
                  onClick={() => toggleExpand(order.orderId)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', flex: 1 }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID</p>
                      <strong style={{ fontSize: '1rem', color: 'white' }}>#000{order.orderId}</strong>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date Placed</p>
                      <span style={{ fontSize: '0.9rem', color: 'white' }}>{dateStr}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Cost</p>
                      <strong style={{ fontSize: '1rem', color: 'var(--secondary)' }}>Rs. {order.totalAmount.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(order.orderStatus)}
                      <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem' }}>{order.orderStatus}</span>
                    </div>
                  </div>
                  
                  <div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
                  <div style={{ padding: '0 1.5rem 1rem' }}>
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}
                    >
                      <XCircle size={16} /> Cancel Order
                    </button>
                  </div>
                )}

                {/* Expanded items list */}
                {isExpanded && (
                  <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '1rem' }}>Items Ordered</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {order.orderItems.map(item => (
                        <div key={item.orderItemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img 
                              src={item.product.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'} 
                              alt={item.product.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div>
                              <strong style={{ color: 'white', fontSize: '0.95rem' }}>{item.product.name}</strong>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unit Price</p>
                            <strong style={{ color: 'white' }}>Rs. {item.unitPrice.toFixed(2)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shipping Location</strong>
                        <p style={{ color: 'white', fontSize: '0.9rem', marginTop: '0.25rem', lineHeight: '1.5' }}>{order.shippingAddress}</p>
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billing Location</strong>
                        <p style={{ color: 'white', fontSize: '0.9rem', marginTop: '0.25rem', lineHeight: '1.5' }}>{order.billingAddress}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
