import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Bot, User as UserIcon, LogOut, Cpu, LayoutGrid, ClipboardList, HelpCircle, Settings } from 'lucide-react';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import PCBuilder from './pages/PCBuilder';
import SavedBuilds from './pages/SavedBuilds';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import PaymentReceipt from './pages/PaymentReceipt';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatbot from './components/AIChatbot';
import { ToastProvider } from './components/Toast';
import ConfirmProvider from './components/ConfirmProvider';
import Footer from './components/Footer';
import { authAPI, cartAPI } from './services/api';
import { clearRedirectState, mergeRedirectState, saveRedirectState } from './utils/redirectState';

function Navigation({ cartCount, setCartCount, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.warn('Logout request failed', e);
    }
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <Cpu size={28} className="glow-text" />
        <span>Computer Hardware</span>
      </Link>
      <ul className="nav-links">
        <li>
          <Link to="/products" className="nav-item">
            <LayoutGrid size={18} /> Products
          </Link>
        </li>
        <li>
          <Link to="/builder" className="nav-item">
            <Cpu size={18} /> PC Builder
          </Link>
        </li>
        <li>
          <Link to="/about" className="nav-item">
            <HelpCircle size={18} /> About
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/dashboard" className="nav-item">
                <UserIcon size={18} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/orders" className="nav-item">
                <ClipboardList size={18} /> My Orders
              </Link>
            </li>
            <li>
              <Link to="/builds" className="nav-item">
                <Settings size={18} /> Saved Builds
              </Link>
            </li>
            {user.role === 'ADMIN' && (
              <li>
                <Link to="/admin" className="nav-item" style={{ color: '#ec4899' }}>
                  <UserIcon size={18} /> Admin Panel
                </Link>
              </li>
            )}
            <li>
              <Link to="/cart" className="nav-item nav-badge-container">
                <ShoppingCart size={20} /> Cart
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
            </li>
            <li className="nav-item" style={{ color: '#9ca3af' }}>
              Hi, {user.name}
            </li>
            <li>
              <button onClick={handleLogoutClick} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                <LogOut size={18} /> Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-item">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

function PreserveStateRedirect() {
  const location = useLocation();
  return <Navigate to="/admin" replace state={location.state} />;
}

function MainApp() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      role: localStorage.getItem('role'),
      name: localStorage.getItem('user_name'),
    };
  });
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCartCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await cartAPI.get();
      const count = response.data.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (e) {
      console.error("Failed to load cart count", e);
    }
  };

  const loadUser = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('user_name');
    if (token) {
      setUser({ role, name });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    fetchCartCount();
  }, [location]);

  useEffect(() => {
    const handleStorageEvent = () => {
      fetchCartCount();
    };

    window.addEventListener('storage', handleStorageEvent);
    const handleAuthUnauthorized = () => {
      setUser(null);
      setCartCount(0);
      const currentPath = location.pathname + location.search;
      if (currentPath !== '/login') {
        const redirectPayload = mergeRedirectState({ from: currentPath }, location.state || {});
        if (location.state?.builderState) {
          redirectPayload.builderState = location.state.builderState;
        }
        saveRedirectState(redirectPayload);
        navigate('/login', { replace: true, state: redirectPayload });
      }
    };

    window.addEventListener('auth-unauthorized', handleAuthUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('auth-unauthorized', handleAuthUnauthorized);
    };
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    clearRedirectState();
    setUser(null);
    setCartCount(0);
  };

  return (
    <div className="app-container">
      <Navigation cartCount={cartCount} setCartCount={setCartCount} user={user} onLogout={handleLogout} />
      <ConfirmProvider>
      <ToastProvider>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails onCartChange={fetchCartCount} />} />
          <Route path="/login" element={<Login user={user} onLoginSuccess={() => { loadUser(); fetchCartCount(); }} />} />
          <Route path="/register" element={<Register user={user} />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute user={user}>
                <Cart onCartChange={fetchCartCount} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute user={user}>
                <Checkout onCheckoutSuccess={fetchCartCount} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute user={user}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder"
            element={
              <ProtectedRoute user={user}>
                <PCBuilder onCartChange={fetchCartCount} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builds"
            element={
              <ProtectedRoute user={user}>
                <SavedBuilds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/receipt"
            element={
              <ProtectedRoute user={user}>
                <PaymentReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />
          {['/Admin', '/AdminDashboard', '/Admin-Dashboard', '/adminDashboard', '/admin-dashboard', '/AdminPanel', '/adminpanel', '/admin-panel'].map((alias) => (
            <Route key={alias} path={`${alias}/*`} element={<PreserveStateRedirect />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      </ToastProvider>
      </ConfirmProvider>
      
      {/* Floating AI chatbot visible for all users, with sign-in guidance when unauthenticated */}
      <AIChatbot user={user} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
