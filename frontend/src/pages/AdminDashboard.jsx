import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, AlertTriangle, Plus, Trash2, DollarSign, ShoppingBag, Box, Loader2, Edit3, XCircle } from 'lucide-react';
import { productsAPI, categoryAPI, brandAPI, ordersAPI } from '../services/api';
import { saveRedirectState } from '../utils/redirectState';
import { confirmAction } from '../utils/confirm';
import { useToast } from '../components/Toast';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // New Product Form States
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [catId, setCatId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [creating, setCreating] = useState(false);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const resetProductForm = () => {
    setEditingProductId(null);
    setName('');
    setDesc('');
    setPrice('');
    setStock('');
    setImageUrl('');
    setCatId('');
    setBrandId('');
  };

  const categorySectionRef = React.useRef(null);
  const brandSectionRef = React.useRef(null);

  // Helper to extract error message from axios error or fallback to generic message
  const getErrorMessage = (error, defaultMessage) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return defaultMessage;
  };

  const scrollToCategorySection = () => categorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToBrandSection = () => brandSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Inline Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' | 'brand'
  const [modalInputName, setModalInputName] = useState('');
  const [modalInputDesc, setModalInputDesc] = useState('');

  const openAddModal = (type) => {
    setModalType(type);
    setModalInputName('');
    setModalInputDesc('');
    setModalOpen(true);
  };
  const closeAddModal = () => setModalOpen(false);

  const handleAddModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalInputName) {
      addToast('Name is required.', 'warning');
      return;
    }
    try {
      if (modalType === 'category') {
        const resp = await categoryAPI.create({ name: modalInputName, description: modalInputDesc });
        const created = resp?.data;
        await fetchAdminData();
        if (created?.categoryId) setCatId(created.categoryId.toString());
        else {
          const fresh = await productsAPI.getCategories();
          const found = fresh.data.find(c => c.name === modalInputName);
          if (found) setCatId(found.categoryId.toString());
        }
        addToast('Category created.', 'success');
      } else {
        const resp = await brandAPI.create({ brandName: modalInputName });
        const created = resp?.data;
        await fetchAdminData();
        if (created?.brandId) setBrandId(created.brandId.toString());
        else {
          const fresh = await productsAPI.getBrands();
          const found = fresh.data.find(b => b.brandName === modalInputName);
          if (found) setBrandId(found.brandId.toString());
        }
        addToast('Brand created.', 'success');
      }
      closeAddModal();
    } catch (err) {
      console.error(err);
      addToast('Failed to create.', 'danger');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.productId);
    setName(product.name || '');
    setDesc(product.description || '');
    setPrice(product.price?.toString() || '');
    setStock(product.stockQuantity?.toString() || '');
    setImageUrl(product.imageUrl || '');
    setCatId(product.category?.categoryId?.toString() || '');
    setBrandId(product.brand?.brandId?.toString() || '');
  };

  const buildProductPayload = () => {
    const selectedCategory = categories.find(c => c.categoryId === parseInt(catId));
    const selectedBrand = brands.find(b => b.brandId === parseInt(brandId));

    const payload = {
      name,
      description: desc,
      price: parseFloat(price),
      stockQuantity: parseInt(stock),
      imageUrl,
    };

    if (selectedCategory) {
      payload.category = selectedCategory;
    }
    if (selectedBrand) {
      payload.brand = selectedBrand;
    }

    return payload;
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
  };

  const resetBrandForm = () => {
    setEditingBrandId(null);
    setBrandNameInput('');
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.categoryId);
    setCategoryName(category.name || '');
    setCategoryDescription(category.description || '');
  };

  const handleEditBrand = (brand) => {
    setEditingBrandId(brand.brandId);
    setBrandNameInput(brand.brandName || '');
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      addToast('Category name is required.', 'warning');
      return;
    }
    try {
      if (editingCategoryId) {
        await categoryAPI.update(editingCategoryId, { name: categoryName, description: categoryDescription });
        addToast('Category updated successfully!', 'success');
      } else {
        await categoryAPI.create({ name: categoryName, description: categoryDescription });
        addToast('Category created successfully!', 'success');
      }
      resetCategoryForm();
      fetchAdminData();
    } catch (e) {
      const errorMsg = getErrorMessage(e, 'Failed to save category.');
      addToast(errorMsg, 'danger');
    }
  };

  const handleSubmitBrand = async (e) => {
    e.preventDefault();
    if (!brandNameInput) {
      addToast('Brand name is required.', 'warning');
      return;
    }
    try {
      if (editingBrandId) {
        await brandAPI.update(editingBrandId, { brandName: brandNameInput });
        addToast('Brand updated successfully!', 'success');
      } else {
        await brandAPI.create({ brandName: brandNameInput });
        addToast('Brand created successfully!', 'success');
      }
      resetBrandForm();
      fetchAdminData();
    } catch (e) {
      const errorMsg = getErrorMessage(e, 'Failed to save brand.');
      addToast(errorMsg, 'danger');
    }
  };

  const handleDeleteCategory = async (id) => {
    const ok = await confirmAction('Delete this category? This may affect existing products.');
    if (!ok) return;
    try {
      await categoryAPI.delete(id);
      addToast('Category deleted successfully!', 'success');
      fetchAdminData();
    } catch (e) {
      const errorMsg = getErrorMessage(e, 'Failed to delete category.');
      addToast(errorMsg, 'danger');
    }
  };

  const handleDeleteBrand = async (id) => {
    const ok = await confirmAction('Delete this brand? This may affect existing products.');
    if (!ok) return;
    try {
      await brandAPI.delete(id);
      addToast('Brand deleted successfully!', 'success');
      fetchAdminData();
    } catch (e) {
      const errorMsg = getErrorMessage(e, 'Failed to delete brand.');
      addToast(errorMsg, 'danger');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, catRes, brandRes] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        productsAPI.getCategories(),
        productsAPI.getBrands()
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      const errorMsg = getErrorMessage(e, 'Failed to load administration dataset.');
      addToast(errorMsg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      addToast("Order status updated successfully!", 'success');
      fetchAdminData();
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      const errorMsg = getErrorMessage(e, 'Failed to update status.');
      addToast(errorMsg, 'danger');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock || !catId || !brandId) {
      addToast("Please fill in all required fields.", 'warning');
      return;
    }

    setCreating(true);
    try {
      const selectedCategory = categories.find(c => c.categoryId === parseInt(catId));
      const selectedBrand = brands.find(b => b.brandId === parseInt(brandId));
      const payload = buildProductPayload();

      if (editingProductId) {
        await productsAPI.update(editingProductId, payload);
        addToast("Component inventory updated successfully!", 'success');
      } else {
        await productsAPI.create(payload);
        addToast("Component successfully added to stock inventory!", 'success');
      }

      resetProductForm();
      fetchAdminData();
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      const errorMsg = getErrorMessage(e, editingProductId ? "Failed to update component." : "Failed to add component.");
      addToast(errorMsg, 'danger');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const ok = await confirmAction("Are you sure you want to remove this component from the catalog?");
    if (!ok) return;
    try {
      await productsAPI.delete(productId);
      addToast("Product deleted.", 'success');
      fetchAdminData();
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      const errorMsg = getErrorMessage(e, "Could not delete product (it may be linked to existing order items).");
      addToast(errorMsg, 'danger');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--secondary)' }} />
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      p.name?.toLowerCase().includes(query) ||
      p.category?.name?.toLowerCase().includes(query) ||
      p.brand?.brandName?.toLowerCase().includes(query)
    );
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => o.orderStatus === 'COMPLETED' ? sum + o.totalAmount : sum, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      <h1 className="display-title" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BarChart3 size={28} /> Administration Control Panel
      </h1>

      {/* Stats Summary Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderColor: 'var(--success)' }}>
          <div style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Revenue (Completed)</p>
            <strong style={{ fontSize: '1.5rem', color: 'white' }}>Rs. {totalRevenue.toFixed(2)}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderColor: 'var(--primary)' }}>
          <div style={{ color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <ShoppingBag size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Orders</p>
            <strong style={{ fontSize: '1.5rem', color: 'white' }}>{totalOrders}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderColor: 'var(--secondary)' }}>
          <div style={{ color: 'var(--secondary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <Box size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unique Hardware</p>
            <strong style={{ fontSize: '1.5rem', color: 'white' }}>{totalProducts}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderColor: 'var(--danger)' }}>
          <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Low Stock Alarms</p>
            <strong style={{ fontSize: '1.5rem', color: 'white' }}>{lowStockProducts.length}</strong>
          </div>
        </div>

      </section>

      {/* Main panels columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column - Order states & alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Low Stock Alerts Box */}
          {lowStockProducts.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--danger)' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <AlertTriangle size={18} /> Low Stock Warnings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {lowStockProducts.map(p => (
                  <div key={p.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span>{p.name} (ID: {p.productId})</span>
                    <strong style={{ color: 'var(--danger)' }}>Only {p.stockQuantity} Left</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manage Orders */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'white', marginBottom: '1.25rem' }}>Process Customer Orders</h3>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders placed in the system yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map(order => (
                  <div key={order.orderId} style={{ padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Order #000{order.orderId}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Customer: {order.user.email} | Cost: Rs. {order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select 
                        value={order.orderStatus} 
                        onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                        className="input-glass"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px', background: 'var(--bg-secondary)', color: 'white' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Product CRUD operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Add New Product Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> {editingProductId ? 'Edit Component' : 'Add Component Stock'}
            </h3>
            
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Component Name *</label>
                <input type="text" className="input-glass" placeholder="e.g. Intel Core i7-14700K" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="input-glass" value={catId} onChange={(e) => setCatId(e.target.value)} style={{ background: 'var(--bg-secondary)', flex: 1 }} required>
                      <option value="">Choose Category</option>
                      {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                    </select>
                    <button type="button" className="btn-secondary" onClick={() => openAddModal('category')} style={{ whiteSpace: 'nowrap' }}>Add</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brand *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="input-glass" value={brandId} onChange={(e) => setBrandId(e.target.value)} style={{ background: 'var(--bg-secondary)', flex: 1 }} required>
                      <option value="">Choose Brand</option>
                      {brands.map(b => <option key={b.brandId} value={b.brandId}>{b.brandName}</option>)}
                    </select>
                    <button type="button" className="btn-secondary" onClick={() => openAddModal('brand')} style={{ whiteSpace: 'nowrap' }}>Add</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price (Rs.) *</label>
                  <input type="number" step="0.01" className="input-glass" placeholder="299.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock Qty *</label>
                  <input type="number" className="input-glass" placeholder="15" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Image URL</label>
                <input type="text" className="input-glass" placeholder="https://image-link.com" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea className="input-glass" rows="2" placeholder="Specs, TDP, socket information details..." value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', flex: 1 }} disabled={creating}>
                  {creating ? <Loader2 size={18} className="animate-spin" /> : editingProductId ? 'Save Changes' : 'Save New Product'}
                </button>
                {editingProductId && (
                  <button type="button" className="btn-secondary" style={{ justifyContent: 'center', flex: 1 }} onClick={resetProductForm} disabled={creating}>
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: '1rem' }}>Manage Categories</h3>
              <form onSubmit={handleSubmitCategory} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category Name *</label>
                  <input type="text" className="input-glass" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Example: Processors" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category Description</label>
                  <textarea className="input-glass" rows="2" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="Optional category description..." />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center', flex: 1 }}>
                    {editingCategoryId ? 'Update Category' : 'Create Category'}
                  </button>
                  {editingCategoryId && (
                    <button type="button" className="btn-secondary" style={{ justifyContent: 'center', flex: 1 }} onClick={resetCategoryForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: '1rem' }}>Manage Brands</h3>
              <form onSubmit={handleSubmitBrand} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brand Name *</label>
                  <input type="text" className="input-glass" value={brandNameInput} onChange={(e) => setBrandNameInput(e.target.value)} placeholder="Example: NVIDIA" required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center', flex: 1 }}>
                    {editingBrandId ? 'Update Brand' : 'Create Brand'}
                  </button>
                  {editingBrandId && (
                    <button type="button" className="btn-secondary" style={{ justifyContent: 'center', flex: 1 }} onClick={resetBrandForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div ref={categorySectionRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', color: 'white', margin: 0 }}>Existing Categories</h4>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {categories.map(category => (
                  <div key={category.categoryId} style={{ padding: '0.9rem 1rem', border: '1px solid var(--border-glass)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{category.name}</strong>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{category.description || 'No description provided.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditCategory(category)} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDeleteCategory(category.categoryId)} className="btn-danger" style={{ fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div ref={brandSectionRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', color: 'white', margin: 0 }}>Existing Brands</h4>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {brands.map(brand => (
                  <div key={brand.brandId} style={{ padding: '0.9rem 1rem', border: '1px solid var(--border-glass)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{brand.brandName}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditBrand(brand)} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDeleteBrand(brand.brandId)} className="btn-danger" style={{ fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {modalOpen && (
              <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}}>
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}} onClick={closeAddModal} />
                <div style={{zIndex:2001,background:'var(--bg-glass)',padding:'1rem',borderRadius:12,boxShadow:'var(--glass-shadow)',minWidth:340}} className="glass-card">
                  <h4 style={{marginTop:0}}>{modalType === 'category' ? 'Add Category' : 'Add Brand'}</h4>
                  <form onSubmit={handleAddModalSubmit} style={{display:'grid',gap:10}}>
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      <label style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{modalType === 'category' ? 'Category Name' : 'Brand Name'} *</label>
                      <input className="input-glass" value={modalInputName} onChange={(e)=>setModalInputName(e.target.value)} required />
                    </div>
                    {modalType === 'category' && (
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        <label style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>Description</label>
                        <textarea className="input-glass" rows={2} value={modalInputDesc} onChange={(e)=>setModalInputDesc(e.target.value)} />
                      </div>
                    )}
                    <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                      <button type="button" className="btn-secondary" onClick={closeAddModal}>Cancel</button>
                      <button type="submit" className="btn-primary">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Manage Catalog Products */}
          <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'white', margin: 0 }}>Catalog Inventory</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filteredProducts.length} of {products.length} products shown</p>
              </div>
              <input
                type="search"
                placeholder="Search by name, category, brand"
                className="input-glass"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '260px', background: 'var(--bg-secondary)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  No products found for "{searchQuery}".
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div key={p.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'white' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price: Rs. {p.price.toFixed(2)} | Stock: {p.stockQuantity}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {p.category?.name ? `${p.category.name}` : 'Uncategorized'} · {p.brand?.brandName ? `${p.brand.brandName}` : 'No brand'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => handleEditProduct(p)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <Edit3 size={16} />
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(p.productId)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
