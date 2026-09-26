import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Cpu as GPUIcon, Database, Tv, HardDrive, Zap, Wind, ArrowRight, Bot, ShieldCheck, Heart } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Processors', icon: <Cpu size={24} />, desc: 'AMD Ryzen & Intel Core' },
  { id: 2, name: 'Motherboards', icon: <Database size={24} />, desc: 'AM5, LGA1700 Chipsets' },
  { id: 3, name: 'RAM', icon: <Database size={24} />, desc: 'High-speed DDR5 & DDR4' },
  { id: 4, name: 'Graphics Cards', icon: <Tv size={24} />, desc: 'NVIDIA RTX & AMD Radeon' },
  { id: 5, name: 'Power Supplies', icon: <Zap size={24} />, desc: '80+ Gold/Platinum Modular' },
  { id: 6, name: 'CPU Coolers', icon: <Wind size={24} />, desc: 'AIO Liquid & Air Coolers' }
];

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* Hero Banner Section */}
      <section className="glass-panel" style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', filter: 'blur(50px)' }} />

        <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '3px', color: 'var(--secondary)', fontWeight: '700' }}>Next-Gen E-Commerce</span>
        <h1 className="display-title" style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.2' }}>
          Build Your Dream PC <br/>With AI-Powered Precision
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Configure compatible components, get immediate hardware recommendations from our Gemini AI Assistant, and order custom assemblies securely.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/builder" className="btn-primary">
            Launch PC Builder <Cpu size={18} />
          </Link>
          <Link to="/products" className="btn-secondary">
            Browse Components <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', gap: '1.25rem' }}>
          <div style={{ color: 'var(--secondary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '10px', height: 'fit-content' }}>
            <Bot size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Gemini AI Assistant</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Chat with our virtual expert. Ask complex configuration queries, compare spec sheets, or troubleshoot installations immediately.
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '1.25rem' }}>
          <div style={{ color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '10px', height: 'fit-content' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Compatibility Guard</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Our validation matrix scans socket configurations, memory generation bounds, and case layout slots to guarantee zero build conflicts.
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '1.25rem' }}>
          <div style={{ color: 'var(--accent)', background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '10px', height: 'fit-content' }}>
            <Zap size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Power Draw Meter</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Accumulates wattage draws for your CPU and GPU, calculates safety margins, and verifies your selected power supply fits criteria.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Search By Hardware Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem' }}>
              <div style={{ color: 'var(--secondary)', background: 'rgba(6, 182, 212, 0.05)', padding: '1rem', borderRadius: '50%' }}>
                {cat.icon}
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', textTransform: 'uppercase' }}>{cat.name}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
}
