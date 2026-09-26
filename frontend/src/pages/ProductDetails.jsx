import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Plus, Minus, Cpu, HelpCircle, Loader2 } from 'lucide-react';
import { productsAPI, cartAPI } from '../services/api';
import { saveRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';

export default function ProductDetails({ onCartChange }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const { addToast } = useToast();

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (e) {
      console.error(e);
      addToast("Product not found.", 'danger');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleQuantity = (type) => {
    if (type === 'inc') {
      if (quantity < product.stockQuantity) setQuantity(quantity + 1);
    } else {
      if (quantity > 1) setQuantity(quantity - 1);
    }
  };

  const resolveBuilderSlot = (product) => {
    const categoryName = product?.category?.name?.toLowerCase() || '';
    if (categoryName.includes('processor') || categoryName.includes('cpu')) return 'cpu';
    if (categoryName.includes('motherboard')) return 'motherboard';
    if (categoryName.includes('memory') || categoryName.includes('ram')) return 'ram';
    if (categoryName.includes('graphics') || categoryName.includes('gpu')) return 'gpu';
    if (categoryName.includes('cooler')) return 'cooler';
    if (categoryName.includes('power') || categoryName.includes('psu')) return 'psu';
    if (categoryName.includes('case')) return 'pcCase';
    if (categoryName.includes('storage') || categoryName.includes('ssd') || categoryName.includes('hdd')) return 'storage';
    return null;
  };

  const buildBuilderState = () => {
    const slotKey = resolveBuilderSlot(product);
    if (!slotKey) return null;
    return {
      buildName: `Customize ${product.name}`,
      components: { [slotKey]: product }
    };
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    const destination = location.pathname + location.search;
    if (!token) {
      saveRedirectState({ from: destination });
      navigate('/login', { replace: true, state: { from: destination } });
      return;
    }
    
    setCartLoading(true);
    try {
      await cartAPI.add(product.productId, quantity);
      onCartChange();
      addToast(`Successfully added ${quantity} item(s) to cart!`, 'success');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast(err.response?.data || "Failed to add items to cart.", 'danger');
    } finally {
      setCartLoading(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back button */}
      <div>
        <Link to="/products" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Left Side - Image & Builder CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={product.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'} 
              alt={product.name} 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '10px' }}
            />
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--secondary)' }}>
            <Cpu size={24} style={{ color: 'var(--secondary)' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>Want to check compatibility?</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Add this component directly to the custom builder interface to check sizing and power constraints.</p>
            </div>
            <Link
              to="/builder"
              state={buildBuilderState()}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              Open Builder
            </Link>
          </div>
        </div>

        {/* Right Side - Info, Price, Add to Cart, Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary)', fontWeight: '700' }}>
              {product.brand.brandName} | {product.category.name}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.5rem', fontFamily: 'var(--font-main)' }}>
              {product.name}
            </h1>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price</p>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>Rs. {product.price.toFixed(2)}</h2>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inventory Status</p>
              {product.stockQuantity > 5 ? (
                <h3 style={{ color: 'var(--success)', fontWeight: '700' }}>In Stock ({product.stockQuantity})</h3>
              ) : product.stockQuantity > 0 ? (
                <h3 style={{ color: 'var(--warning)', fontWeight: '700' }}>Low Stock ({product.stockQuantity})</h3>
              ) : (
                <h3 style={{ color: 'var(--danger)', fontWeight: '700' }}>Out of Stock</h3>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {product.description || "No description provided for this component."}
            </p>
          </div>

          {/* Add to Cart Actions */}
          {product.stockQuantity > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.25rem' }}>
                <button onClick={() => handleQuantity('dec')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', padding: '0 1rem' }}>{quantity}</span>
                <button onClick={() => handleQuantity('inc')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={cartLoading}>
                {cartLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add To Shopping Cart
                  </>
                )}
              </button>
            </div>
          )}

          {/* Specifications Table */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Technical Specifications</h3>
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              {product.specifications && product.specifications.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr key={spec.specificationId} style={{ borderBottom: index === product.specifications.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: '500', width: '40%', textTransform: 'capitalize' }}>
                          {spec.specificationName.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: '600' }}>
                          {spec.specificationValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No specs available for this product.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
