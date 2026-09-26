import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const preventDefault = (event) => event.preventDefault();

  return (
    <footer style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(25,33,71,0.6) 100%)',
      borderTop: '1px solid rgba(99,102,241,0.2)',
      color: 'var(--text-muted)',
      padding: '3rem 2rem 1.5rem',
      marginTop: '4rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Brand Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
            <Cpu size={32} className="glow-text" />
            <span>Computer Hardware</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Premium PC components and AI-powered compatibility checking. Build your dream machine with confidence.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }} title="GitHub" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}>
              <Github size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }} title="Twitter" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}>
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }} title="LinkedIn" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}>
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Home</Link></li>
            <li><Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Products</Link></li>
            <li><Link to="/builder" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>PC Builder</Link></li>
            <li><Link to="/builds" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Saved Builds</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>FAQ</a></li>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Contact Us</a></li>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Shipping Info</a></li>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Returns</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Terms of Service</a></li>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Privacy Policy</a></li>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Cookie Policy</a></li>
            <li><a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Disclaimer</a></li>
          </ul>
        </div>

      </div>

      {/* Contact Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Mail size={20} style={{ color: 'var(--secondary)', marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</div>
            <a href="mailto:support@hardwareai.com" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>support@hardwareai.com</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Phone size={20} style={{ color: 'var(--secondary)', marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</div>
            <a href="tel:+1-800-HARDWARE" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>+036 22 59 366</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <MapPin size={20} style={{ color: 'var(--secondary)', marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location</div>
            <div style={{ color: 'white', fontWeight: '500' }}>Rathnapura,Srilanka</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>&copy; {currentYear} Computer Hardware AI. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Sitemap</a>
          <a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Status</a>
          <a href="#" onClick={preventDefault} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Accessibility</a>
        </div>
      </div>
    </footer>
  );
}
