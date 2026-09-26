import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Cpu, Database, Tv, Wind, Zap, Package, HardDrive, Plus, Trash2, Eye, ShieldCheck, ShieldAlert, AlertTriangle, ShoppingCart, Save, Loader2, RefreshCw } from 'lucide-react';
import { productsAPI, pcBuilderAPI, cartAPI } from '../services/api';
import { normalizeRedirectState, readRedirectState, saveRedirectState, clearRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';

const SLOTS = [
  { key: 'cpu', label: 'Processor (CPU)', categoryMatch: 'processor', icon: <Cpu size={20} /> },
  { key: 'motherboard', label: 'Motherboard', categoryMatch: 'motherboard', icon: <Cpu size={20} /> },
  { key: 'ram', label: 'Memory (RAM)', categoryMatch: 'ram', icon: <Database size={20} /> },
  { key: 'gpu', label: 'Graphics Card (GPU)', categoryMatch: 'graphics', icon: <Tv size={20} /> },
  { key: 'cooler', label: 'CPU Cooler', categoryMatch: 'cooler', icon: <Wind size={20} /> },
  { key: 'psu', label: 'Power Supply (PSU)', categoryMatch: 'power', icon: <Zap size={20} /> },
  { key: 'pcCase', label: 'PC Case', categoryMatch: 'case', icon: <Package size={20} /> },
  { key: 'storage', label: 'Storage (SSD/HDD)', categoryMatch: 'storage', icon: <HardDrive size={20} /> }
];

export default function PCBuilder({ onCartChange }) {
  const [buildName, setBuildName] = useState('My Custom Gaming Rig');
  const [components, setComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null, cooler: null, psu: null, pcCase: null, storage: null
  });
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const persistedRedirectState = readRedirectState();
    const mergedState = {
      ...persistedRedirectState,
      ...normalizeRedirectState(location.state),
    };
    const builderState = normalizeRedirectState(mergedState)?.builderState;
    if (builderState) {
      setBuildName(builderState.buildName || 'My Custom Gaming Rig');
      setComponents({
        cpu: builderState.cpu || null,
        motherboard: builderState.motherboard || null,
        ram: builderState.ram || null,
        gpu: builderState.gpu || null,
        cooler: builderState.cooler || null,
        psu: builderState.psu || null,
        pcCase: builderState.pcCase || null,
        storage: builderState.storage || null,
      });
      clearRedirectState();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Modal & Selection States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [slotProducts, setSlotProducts] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        setCategories(response.data);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    loadCategories();
  }, []);

  const findCategoryIdForSlot = (slot) => {
    const category = categories.find((c) => c.name.toLowerCase().includes(slot.categoryMatch));
    return category?.categoryId || null;
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

  // Compatibility Engine States
  const [compatResult, setCompatResult] = useState({ compatible: true, messages: ['No components selected.'], warnings: [], totalWattage: 0 });
  const [checkingCompat, setCheckingCompat] = useState(false);
  const [savingBuild, setSavingBuild] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load compatibility metrics whenever components change
  const runCompatCheck = async () => {
    setCheckingCompat(true);
    try {
      const response = await pcBuilderAPI.checkCompatibility(components);
      setCompatResult(response.data);
    } catch (e) {
      console.error("Compatibility assessment failed", e);
      setCompatResult({
        compatible: false,
        messages: ["Compatibility service unavailable. Please retry or check your connection."],
        warnings: [],
        totalWattage: 0
      });
    } finally {
      setCheckingCompat(false);
    }
  };

  useEffect(() => {
    runCompatCheck();
  }, [components]);

  const openSelectionModal = async (slot) => {
    const categoryId = findCategoryIdForSlot(slot);
    if (!categoryId) {
      addToast("Unable to find category for this slot.", 'danger');
      return;
    }

    setActiveSlot(slot);
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const response = await productsAPI.getAll({ categoryId });
      setSlotProducts(response.data);
    } catch (e) {
      addToast("Failed to load components lists.", 'danger');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSelectComponent = (product) => {
    setComponents(prev => ({
      ...prev,
      [activeSlot.key]: product
    }));
    setIsModalOpen(false);
  };

  const handleRemoveComponent = (slotKey) => {
    setComponents(prev => ({
      ...prev,
      [slotKey]: null
    }));
  };

  const handleAddBundleToCart = async () => {
    const token = localStorage.getItem('token');
    const destination = location.pathname + location.search;
    if (!token) {
      saveRedirectState({ from: destination, builderState: { buildName, components } });
      navigate('/login', {
        replace: true,
        state: {
          from: destination,
          builderState: { buildName, components }
        }
      });
      return;
    }

    const selectedKeys = Object.keys(components).filter(k => components[k] !== null);
    if (selectedKeys.length === 0) {
      addToast("Please select at least one component first.", 'warning');
      return;
    }

    setAddingToCart(true);
    try {
      // Loop add components to cart
      for (const key of selectedKeys) {
        await cartAPI.add(components[key].productId, 1);
      }
      onCartChange();
      addToast("All selected components have been added to your shopping cart!", 'success');
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination, builderState: { buildName, components } });
        navigate('/login', { replace: true, state: { from: destination, builderState: { buildName, components } } });
        return;
      }
      addToast("Failed to add bundle to cart.", 'danger');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSaveBuild = async () => {
    const token = localStorage.getItem('token');
    const destination = location.pathname + location.search;
    if (!token) {
      saveRedirectState({ from: destination, builderState: { buildName, components } });
      navigate('/login', {
        replace: true,
        state: {
          from: destination,
          builderState: { buildName, components }
        }
      });
      return;
    }

    const selectedKeys = Object.keys(components).filter(k => components[k] !== null);
    if (selectedKeys.length === 0) {
      addToast("Please select at least one component to save your build.", 'warning');
      return;
    }

    setSavingBuild(true);
    try {
      await pcBuilderAPI.saveBuild(buildName, components);
      addToast("Build successfully saved to your profile!", 'success');
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination, builderState: { buildName, components } });
        navigate('/login', { replace: true, state: { from: destination, builderState: { buildName, components } } });
        return;
      }
      addToast("Failed to save build to profile.", 'danger');
    } finally {
      setSavingBuild(false);
    }
  };

  // Calculate Subtotal
  const buildPrice = Object.values(components).reduce((sum, item) => sum + (item ? item.price : 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="display-title" style={{ fontSize: '2rem' }}>Rig Configurator</h1>
          <input 
            type="text" 
            value={buildName} 
            onChange={(e) => setBuildName(e.target.value)} 
            style={{ background: 'none', border: 'none', borderBottom: '1px dashed var(--secondary)', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-muted)', outline: 'none', marginTop: '0.25rem', paddingBottom: '4px', width: '250px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSaveBuild} className="btn-secondary" disabled={savingBuild}>
            {savingBuild ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Config</>}
          </button>
          <button onClick={handleAddBundleToCart} className="btn-primary" disabled={addingToCart}>
            {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <><ShoppingCart size={18} /> Add Rig to Cart</>}
          </button>
        </div>
      </div>

      <div className="builder-grid">
        
        {/* Component Slots list */}
        <section className="glass-panel" style={{ padding: '0.5rem 0' }}>
          {SLOTS.map(slot => {
            const selectedItem = components[slot.key];
            return (
              <div key={slot.key} className="component-slot">
                
                <div className="slot-details" style={{ flex: 1 }}>
                  <div className="slot-icon">
                    {slot.icon}
                  </div>
                  <div className="slot-info">
                    <h4>{slot.label}</h4>
                    {selectedItem ? (
                      <p style={{ color: 'white' }}>{selectedItem.name}</p>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontWeight: '400' }}>Not Configured</p>
                    )}
                  </div>
                </div>

                {selectedItem ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'white' }}>Rs. {selectedItem.price.toFixed(2)}</strong>
                    <button 
                      onClick={() => openSelectionModal(slot)} 
                      className="btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Swap
                    </button>
                    <button 
                      onClick={() => handleRemoveComponent(slot.key)} 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => openSelectionModal(slot)} 
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Plus size={16} /> Choose
                  </button>
                )}

              </div>
            );
          })}
        </section>

        {/* Compatibility & Pricing Metrics panel */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--secondary)' }}>Rig Status</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Config Cost</span>
              <strong style={{ fontSize: '1.35rem', color: 'white' }}>Rs. {buildPrice.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Draw</span>
              <strong style={{ fontSize: '1.1rem', color: 'white' }}>{compatResult.totalWattage} W</strong>
            </div>

            {/* Verification box */}
            <div>
              <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Compatibility Engine</span>
                {checkingCompat && <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--secondary)' }} />}
              </div>

              {compatResult.compatible ? (
                <div className="compat-success" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>System Validated</strong>
                    <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.85 }}>All sockets and parameters are physically compatible.</p>
                  </div>
                </div>
              ) : (
                <div className="compat-error" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Conflict Detected</strong>
                    <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.85 }}>Scroll messages below to resolve incompatibilities.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages box */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Log messages</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                {compatResult.messages.map((m, idx) => (
                  <li key={idx} style={{ color: '#e5e7eb', borderLeft: '2px solid rgba(99,102,241,0.5)', paddingLeft: '6px' }}>{m}</li>
                ))}
                {compatResult.warnings.map((w, idx) => (
                  <li key={idx} style={{ color: '#fcd34d', borderLeft: '2px solid #f59e0b', paddingLeft: '6px', display: 'flex', gap: '4px' }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '2px' }} /> {w}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </aside>
      </div>

      {/* Choose Component Modal popup */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '750px', maxHeight: '80%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', color: 'white' }}>
                Choose {activeSlot?.label}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {modalLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Loader2 size={36} className="animate-spin" style={{ color: 'var(--secondary)' }} />
                </div>
              ) : slotProducts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hardware items currently stocked in this category.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {slotProducts.map(prod => (
                    <div key={prod.productId} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <img 
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'} 
                          alt={prod.name} 
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <strong style={{ color: 'white' }}>{prod.name}</strong>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            Specs: {prod.specifications.map(s => `${s.specificationName}: ${s.specificationValue}`).join(', ')}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Rs. {prod.price.toFixed(2)}</span>
                        <button onClick={() => handleSelectComponent(prod)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
