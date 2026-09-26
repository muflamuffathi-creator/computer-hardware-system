import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingCart, Info, Eye, Loader2 } from 'lucide-react';
import { productsAPI, cartAPI } from '../services/api';
import { saveRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filter States
  const [keyword, setKeyword] = useState('');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('categoryId') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const loadFilterOptions = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        productsAPI.getCategories(),
        productsAPI.getBrands()
      ]);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
    } catch (e) {
      console.error("Failed to load filter metrics", e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({
        keyword: keyword || undefined,
        categoryId: selectedCat || undefined,
        brandId: selectedBrand || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined
      });
      setProducts(response.data);
    } catch (e) {
      console.error("Failed to query catalog", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [keyword, selectedCat, selectedBrand, minPrice, maxPrice]);

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    const destination = location.pathname + location.search;
    if (!token) {
      saveRedirectState({ from: destination });
      navigate('/login', { replace: true, state: { from: destination } });
      return;
    }
    
    setCartLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.add(productId, 1);
      // Custom event or simple reload to update navbar badge
      window.dispatchEvent(new Event('storage'));
      addToast("Product added to cart!", 'success');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast(err.response?.data || "Failed to add product to cart.", 'danger');
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div>
      <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Store Catalog</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        
        {/* Sidebar Filters */}
        <aside className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', color: 'var(--secondary)' }}>Filter Tools</h3>
          
          {/* Keyword Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search Item</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="Product name..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <Search size={18} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
            <select 
              className="input-glass" 
              value={selectedCat} 
              onChange={(e) => setSelectedCat(e.target.value)}
              style={{ background: 'var(--bg-secondary)', color: 'white' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brand</label>
            <select 
              className="input-glass" 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{ background: 'var(--bg-secondary)', color: 'white' }}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
              ))}
            </select>
          </div>

          {/* Price Boundaries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price Range (Rs.)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                className="input-glass" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input 
                type="number" 
                className="input-glass" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Reset Filters */}
          <button 
            className="btn-secondary" 
            onClick={() => {
              setKeyword('');
              setSelectedCat('');
              setSelectedBrand('');
              setMinPrice('');
              setMaxPrice('');
            }}
            style={{ padding: '0.5rem', fontSize: '0.9rem', justifyContent: 'center' }}
          >
            Clear Filters
          </button>
        </aside>

        {/* Main Grid View */}
        <section>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <Loader2 size={48} className="animate-spin" style={{ color: 'var(--secondary)' }} />
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No products found matching those search terms.
            </div>
          ) : (
            <div className="catalog-grid">
              {products.map(prod => (
                <div key={prod.productId} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <img src={prod.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'} alt={prod.name} className="product-image" />
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--secondary)', fontWeight: '700' }}>
                      {prod.brand.brandName} | {prod.category.name}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0', minHeight: '44px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '0.75rem' }}>
                      Rs. {prod.price.toFixed(2)}
                    </p>
                    
                    {/* Stock indicator */}
                    <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                      {prod.stockQuantity > 5 ? (
                        <span style={{ color: 'var(--success)' }}>✔ In Stock ({prod.stockQuantity})</span>
                      ) : prod.stockQuantity > 0 ? (
                        <span style={{ color: 'var(--warning)' }}>⚠ Low Stock ({prod.stockQuantity})</span>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>✖ Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <Link to={`/products/${prod.productId}`} className="btn-secondary" style={{ padding: '0.6rem', flex: 1, justifyContent: 'center' }} title="View details">
                      <Eye size={18} /> Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(prod.productId)}
                      className="btn-primary" 
                      style={{ padding: '0.6rem', flex: 1.5, justifyContent: 'center' }} 
                      disabled={prod.stockQuantity <= 0 || cartLoading[prod.productId]}
                    >
                      {cartLoading[prod.productId] ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={18} /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
