import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { cartAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { confirmAction } from '../utils/confirm';
import { saveRedirectState } from '../utils/redirectState';

export default function Cart({ onCartChange }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (e) {
      console.error("Failed to load cart data", e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantity = async (productId, currentQty, type) => {
    let newQty = type === 'inc' ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) {
      handleRemove(productId);
      return;
    }

    const key = `${productId}-qty`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await cartAPI.update(productId, newQty);
      setCart(response.data);
      onCartChange();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast(err.response?.data || "Failed to update item quantity.", 'danger');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleRemove = async (productId) => {
    const key = `${productId}-remove`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await cartAPI.remove(productId);
      setCart(response.data);
      onCartChange();
      addToast("Item removed from cart.", 'success');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast("Failed to remove item.", 'danger');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleClear = async () => {
    const ok = await confirmAction("Are you sure you want to clear your cart?");
    if (!ok) return;
    try {
      await cartAPI.clear();
      setCart({ cartItems: [] });
      onCartChange();
      addToast('Cart cleared.', 'success');
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast("Failed to clear cart.", 'danger');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--secondary)' }} />
      </div>
    );
  }

  const items = cart?.cartItems || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div>
      <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShoppingCart size={28} /> Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your shopping cart is currently empty.</p>
          <Link to="/products" className="btn-primary">
            <ArrowLeft size={16} /> Browse Hardware Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Cart Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map(item => (
                <div key={item.cartItemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {/* Product Metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 2 }}>
                    <img 
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'} 
                      alt={item.product.name} 
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>{item.product.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                        {item.product.brand.brandName}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price</p>
                    <p style={{ fontWeight: '600', color: 'white' }}>Rs. {item.product.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity Actions */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleQuantity(item.product.productId, item.quantity, 'dec')} 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', borderRadius: '4px' }}
                      disabled={actionLoading[`${item.product.productId}-qty`]}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: '700', padding: '0 0.5rem', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantity(item.product.productId, item.quantity, 'inc')} 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', borderRadius: '4px' }}
                      disabled={actionLoading[`${item.product.productId}-qty`]}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Total & Delete */}
                  <div style={{ flex: 1.2, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total</p>
                      <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>Rs. {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.product.productId)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                      disabled={actionLoading[`${item.product.productId}-remove`]}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link to="/products" className="btn-secondary">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
              <button onClick={handleClear} className="btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <Trash2 size={16} /> Clear Cart
              </button>
            </div>
          </div>

          {/* Pricing Summary Sidepanel */}
          <aside className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--secondary)' }}>Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span style={{ color: 'var(--success)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (Estimated)</span>
                <span>Rs. 0.00</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800' }}>
              <span>Total Price</span>
              <span style={{ color: 'var(--secondary)' }}>Rs. {subtotal.toFixed(2)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              Proceed To Checkout <CreditCard size={18} />
            </button>
          </aside>

        </div>
      )}
    </div>
  );
}
