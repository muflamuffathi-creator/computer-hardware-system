import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, UserPlus, Loader2, User } from 'lucide-react';
import { authAPI } from '../services/api';
import { clearRedirectState, mergeRedirectState, readRedirectState, saveRedirectState } from '../utils/redirectState';
import { useToast } from '../components/Toast';

export default function Register({ user }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const persistedRedirectState = readRedirectState();
  const redirectState = useMemo(
    () => mergeRedirectState({ ...(persistedRedirectState || {}) }, location.state || {}),
    [location.state, persistedRedirectState]
  );
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
      const shouldRestoreBuild = builderState && destination.startsWith('/builder');
      clearRedirectState();
      if (shouldRestoreBuild) {
        navigate(destination, { replace: true, state: { builderState } });
      } else {
        navigate(destination, { replace: true });
      }
    }
  }, [user, redirectState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.register(firstName, lastName, email, password);
      setSuccess("Account created successfully! Redirecting to login...");
      if (redirectState?.from || redirectState?.builderState) {
        saveRedirectState({ from: redirectState?.from, builderState: redirectState?.builderState });
      }
      setTimeout(() => {
        addToast('Account created successfully! Please sign in.', 'success');
        navigate('/login', { state: { from: redirectState?.from, builderState: redirectState?.builderState } });
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to create account. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join now to design, save, and order custom PCs.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            You can register with any email address, including Gmail. Accounts are stored locally for this app.
          </p>
        </div>

        {error && (
          <div className="compat-error" style={{ fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="compat-success" style={{ fontSize: '0.85rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>First Name</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="John" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last Name</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="Doe" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="input-glass" 
                placeholder="john.doe@example.com" 
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
                placeholder="•••••••• (Min 6 chars)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="input-glass" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <UserPlus size={18} /> Register Now
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" state={{ from: redirectState?.from, builderState: redirectState?.builderState }} style={{ color: 'var(--secondary)', fontWeight: '600' }}>Login here</Link>
        </div>

      </div>
    </div>
  );
}
