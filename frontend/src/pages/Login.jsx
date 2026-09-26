import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { clearRedirectState, mergeRedirectState, readRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';

export default function Login({ user, onLoginSuccess }) {
  const location = useLocation();
  const persistedRedirectState = readRedirectState();
  const redirectState = useMemo(
    () => mergeRedirectState({ ...(persistedRedirectState || {}) }, location.state || {}),
    [location.state, persistedRedirectState]
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const getErrorMessage = (error) => {
    const responseData = error?.response?.data;
    if (!responseData) {
      return error?.message || 'Unknown error occurred. Please try again.';
    }
    return typeof responseData === 'string'
      ? responseData
      : responseData.message || JSON.stringify(responseData);
  };

  useEffect(() => {
    if (user) {
      const defaultDestination = user.role === 'ADMIN' ? '/admin' : '/builder';
      const requestedPath = redirectState?.from;
      const builderState = redirectState?.builderState;
      const lowerRequestedPath = typeof requestedPath === 'string' ? requestedPath.toLowerCase() : '';
      const isAdminTarget = lowerRequestedPath.startsWith('/admin');
      const destination = isAdminTarget && user.role !== 'ADMIN' ? defaultDestination : requestedPath || defaultDestination;
      if (destination === '/builder' && builderState) {
        navigate('/builder', { replace: true, state: { builderState } });
      } else {
        navigate(destination, { replace: true });
      }
      clearRedirectState();
    }
  }, [user, redirectState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user_name', `${data.firstName} ${data.lastName}`);
      
      onLoginSuccess();
      addToast("Successfully logged in!", 'success');
      const defaultDestination = data.role === 'ADMIN' ? '/admin' : '/builder';
      const requestedPath = redirectState?.from;
      const builderState = redirectState?.builderState;
      const isAdminTarget = typeof requestedPath === 'string' && requestedPath.startsWith('/admin');
      const destination = isAdminTarget && data.role !== 'ADMIN' ? defaultDestination : requestedPath || defaultDestination;
      const shouldRestoreBuild = builderState && destination.startsWith('/builder');
      clearRedirectState();
      if (shouldRestoreBuild) {
        navigate(destination, { replace: true, state: { builderState } });
      } else {
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error('Login error', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      addToast(errorMessage || 'Login failed. Check credentials.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Access Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to synchronize builds and check out.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            If you do not already have an account, register first using any valid email address.
          </p>
        </div>

        {error && (
          <div className="compat-error" style={{ fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="input-glass" 
                placeholder="customer@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="input-glass" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" state={{ from: redirectState?.from, builderState: redirectState?.builderState }} style={{ color: 'var(--secondary)', fontWeight: '600' }}>Register here</Link>
        </div>

        

      </div>
    </div>
  );
}
