import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { cartAPI, ordersAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { saveRedirectState } from '../utils/redirectState';

export default function Checkout({ onCheckoutSuccess }) {
  const [cart, setCart] = useState(null);
  const [shipping, setShipping] = useState('');
  const [billing, setBilling] = useState('');
  const [isSame, setIsSame] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      if (response.data.cartItems.length === 0) {
        navigate('/cart');
      }
      setCart(response.data);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!shipping) {
      addToast("Shipping address is required.", 'warning');
      return;
    }

    const billingAddress = isSame ? shipping : billing;
    if (!isSame && !billing) {
      addToast("Billing address is required.", 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await ordersAPI.checkout(shipping, billingAddress);
      const receipt = response.data;
      try {
        localStorage.setItem('lastReceipt', JSON.stringify(receipt));
      } catch (e) {
        console.warn('Failed to save receipt locally', e);
      }
      onCheckoutSuccess();
      navigate('/receipt', { replace: true, state: { receipt } });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast(err.response?.data || "Transaction failed. Please try again.", 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--secondary)' }} />
      </div>
    );
  }

  // Success view
  if (orderConfirmed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '540px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
          <div style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <CheckCircle size={64} className="glow-text" />
          </div>
          <h2 className="display-title" style={{ fontSize: '1.75rem' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Thank you for shopping with Antigravity Hardware. Your transaction completed successfully.
          </p>
          <div className="glass-card" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ color: 'white' }}>#000{orderConfirmed.orderId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
              <strong style={{ color: 'var(--secondary)' }}>Rs. {orderConfirmed.totalAmount.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <strong style={{ color: 'var(--success)' }}>{orderConfirmed.orderStatus}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <Link to="/orders" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Track My Orders
            </Link>
            <Link to="/products" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Back To Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.cartItems || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div>
      <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CreditCard size={28} /> Checkout Portal
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Checkout Form */}
        <form onSubmit={handleOrder} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', height: 'fit-content' }}>
          
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} /> Shipping Location
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Street Address, City, Postal Code, Country</label>
            <textarea 
              className="input-glass" 
              rows="3" 
              placeholder="e.g.46/12 Nawam Mawatha, Colombo 2" 
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="sameAddress" 
              checked={isSame}
              onChange={() => setIsSame(!isSame)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="sameAddress" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Billing address is same as shipping address</label>
          </div>

          {!isSame && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.3s' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Billing Address</label>
              <textarea 
                className="input-glass" 
                rows="3" 
                placeholder="Billing address..." 
                value={billing}
                onChange={(e) => setBilling(e.target.value)}
                required={!isSame}
              />
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '1rem' }}>Payment Method</h3>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', borderColor: 'var(--primary)' }}>
              <input type="radio" defaultChecked style={{ accentColor: 'var(--primary)' }} />
              <div>
                <strong style={{ color: 'white' }}>Cash On Delivery (COD) / Pay On Assembly</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Pay securely in cash or card when your components arrive at your doorstep.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/cart" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Edit Cart
            </Link>
            <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={submitting}>
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Confirm & Place Order
                </>
              )}
            </button>
          </div>

        </form>

        {/* Order review sidebar */}
        <aside className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--secondary)' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            {items.map(item => (
              <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {item.product.name} <span style={{ color: 'white', fontWeight: '700' }}>x{item.quantity}</span>
                </span>
                <span>Rs. {(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
              <span style={{ color: 'var(--success)' }}>FREE</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800' }}>
            <span>Final Total</span>
            <span style={{ color: 'var(--secondary)' }}>Rs. {subtotal.toFixed(2)}</span>
          </div>
        </aside>

      </div>
    </div>
  );
}
