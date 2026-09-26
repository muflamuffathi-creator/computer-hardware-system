import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Trash2, Cpu, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';
import { pcBuilderAPI, cartAPI } from '../services/api';
import { saveRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';
import { confirmAction } from '../utils/confirm';

export default function SavedBuilds() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingBuildId, setDeletingBuildId] = useState(null);
  const [addingBuildId, setAddingBuildId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const loadBuilds = async () => {
    setLoading(true);
    try {
      const response = await pcBuilderAPI.getMyBuilds();
      setBuilds(response.data || []);
    } catch (err) {
      console.error('Failed to load saved builds', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast('Failed to load saved builds.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirmAction('Delete this saved configuration?');
    if (!ok) return;
    setDeletingBuildId(id);
    try {
      await pcBuilderAPI.deleteBuild(id);
      setBuilds((prev) => prev.filter((build) => build.buildId !== id));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const destination = location.pathname + location.search;
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      addToast('Failed to delete build.', 'danger');
      console.error(err);
    } finally {
      setDeletingBuildId(null);
    }
  };

  const handleLoadBuild = (build) => {
    navigate('/builder', { state: { builderState: build } });
  };

  const handleAddBuildToCart = async (build) => {
    const token = localStorage.getItem('token');
    const destination = location.pathname + location.search;
    if (!token) {
      saveRedirectState({ from: destination });
      navigate('/login', { replace: true, state: { from: destination } });
      return;
    }

    setAddingBuildId(build.buildId);
    try {
      const componentIds = ['cpu', 'motherboard', 'ram', 'gpu', 'cooler', 'psu', 'pcCase', 'storage']
        .map((slot) => build[slot]?.productId)
        .filter(Boolean);

      if (componentIds.length === 0) {
        addToast('This build contains no items.', 'warning');
        return;
      }

      for (const productId of componentIds) {
        await cartAPI.add(productId, 1);
      }

      window.dispatchEvent(new Event('storage'));
      addToast('Build components added to your cart successfully!', 'success');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        saveRedirectState({ from: destination });
        navigate('/login', { replace: true, state: { from: destination } });
        return;
      }
      console.error(err);
      addToast('Failed to add build components to cart.', 'danger');
    } finally {
      setAddingBuildId(null);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="display-title" style={{ fontSize: '2rem' }}>Saved PC Builds</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage your saved PC configurations, review component selections, and remove outdated builds.</p>
        </div>
        <Link to="/builder" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} /> Build a New Rig
        </Link>
      </div>

      {builds.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No saved builds yet. Save a PC configuration from the builder to access it here.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {builds.map((build) => (
            <div key={build.buildId} className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>{build.buildName}</h2>
                  <span style={{ padding: '0.25rem 0.7rem', borderRadius: '999px', background: 'rgba(99,102,241,0.12)', color: '#e0e7ff', fontSize: '0.8rem' }}>Rs. {build.totalPrice?.toFixed(2) || '0.00'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {['cpu', 'motherboard', 'ram', 'gpu', 'cooler', 'psu', 'pcCase', 'storage'].map((slot) => {
                    const product = build[slot];
                    return (
                      <div key={slot} style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '12px', minHeight: '90px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{slot === 'pcCase' ? 'Case' : slot.charAt(0).toUpperCase() + slot.slice(1)}</div>
                        {product ? (
                          <>
                            <div style={{ fontWeight: '700', color: 'white' }}>{product.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rs. {product.price?.toFixed(2)}</div>
                            <Link to={`/products/${product.productId}`} style={{ color: 'var(--secondary)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                              View item <ArrowRight size={12} />
                            </Link>
                          </>
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not selected</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', minWidth: '160px' }}>
                <button
                  onClick={() => handleLoadBuild(build)}
                  className="btn-primary"
                  style={{ justifyContent: 'center' }}
                >
                  <Cpu size={16} /> Load Build
                </button>
                <button
                  onClick={() => handleAddBuildToCart(build)}
                  className="btn-primary"
                  disabled={addingBuildId === build.buildId}
                  style={{ justifyContent: 'center' }}
                >
                  {addingBuildId === build.buildId ? <Loader2 size={18} className="animate-spin" /> : <><ShoppingCart size={16} /> Add All to Cart</>}
                </button>
                <button
                  onClick={() => handleDelete(build.buildId)}
                  className="btn-secondary"
                  disabled={deletingBuildId === build.buildId}
                  style={{ justifyContent: 'center' }}
                >
                  {deletingBuildId === build.buildId ? <Loader2 size={18} className="animate-spin" /> : <><Trash2 size={16} /> Delete Build</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
