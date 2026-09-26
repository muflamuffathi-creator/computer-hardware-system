import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIChatbot({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Unknown');
  const messagesEndRef = useRef(null);
  const isAuthenticated = Boolean(user);

  const fetchHistory = async () => {
    if (!isAuthenticated) {
      setMessages([{ role: 'ai', text: "Sign in to use the Gemini AI Assistant. Please log in or register to start hardware chat." }]);
      return;
    }

    try {
      const response = await aiAPI.getHistory();
      const history = [];
      response.data.forEach(chat => {
        history.push({ role: 'user', text: chat.question, createdAt: chat.createdAt });
        history.push({ role: 'ai', text: chat.response, createdAt: chat.createdAt });
      });
      if (history.length === 0) {
        history.push({ 
          role: 'ai', 
          text: "Hello! I am your Gemini AI Tech Assistant. Ask me anything! I can check compatibility, recommend parts, or suggest full PC configurations." 
        });
      }
      setMessages(history);
    } catch (e) {
      console.error("Failed to load chat history", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setMessages([{ role: 'ai', text: "Session expired. Please sign out and sign back in to restore your AI chat history." }]);
      } else {
        setMessages([{ role: 'ai', text: "Welcome! Feel free to ask me technical questions or ask for hardware suggestions." }]);
      }
    }
  };

  const checkBackendStatus = async () => {
    try {
      await aiAPI.checkBackend();
      setBackendStatus('Online');
    } catch (e) {
      console.warn('Backend status check failed', e);
      setBackendStatus('Offline');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      checkBackendStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!isAuthenticated) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Please sign in to use the AI assistant.', createdAt: new Date().toISOString() }]);
      return;
    }

    const userMsg = input.trim();
    if (!userMsg || loading) return;

    const timestamp = new Date().toISOString();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, createdAt: timestamp }]);
    setLoading(true);

    try {
      const response = await aiAPI.chat(userMsg);
      const reply = response.data?.reply ?? (typeof response.data === 'string' ? response.data : JSON.stringify(response.data) || "Sorry, the AI returned an unexpected response.");
      setMessages(prev => [...prev, { role: 'ai', text: reply, createdAt: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const respData = err?.response?.data;
      // Friendly fallback without exposing raw server error bodies (Spring Boot JSON)
      const fallbackReply = "Sorry, I couldn't reach my processor. Please try again in a moment.";
      if (status === 401 || status === 403) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Please sign in again to use the AI assistant.', createdAt: new Date().toISOString() }]);
      } else {
        // If server returned a user-friendly message string, prefer that; otherwise always use fallback
        let nice = null;
        if (respData) {
          if (typeof respData === 'string' && respData.trim().length > 0) nice = respData;
          else if (respData.message && typeof respData.message === 'string' && respData.message.trim().length > 0) nice = respData.message;
        }
        const userMessage = nice || fallbackReply;
        setMessages(prev => [...prev, { role: 'ai', text: userMessage, createdAt: new Date().toISOString() }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePredefined = (text) => {
    setInput(text);
  };

  const formatTimestamp = (createdAt) => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button className="ai-fab" onClick={() => setIsOpen(!isOpen)} title="AI Assistant">
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>

      {/* Slide-out Panel */}
      <div className={`ai-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={24} style={{ color: '#06b6d4' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Gemini Assistant</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isAuthenticated ? 'Online Hardware Expert' : 'Sign in to start chatting'}
              </p>
              <span style={{ display: 'block', fontSize: '0.7rem', marginTop: '0.25rem', color: backendStatus === 'Online' ? '#34d399' : backendStatus === 'Offline' ? '#f87171' : '#94a3b8' }}>
                Backend: {backendStatus}
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <X size={20} />
          </button>
        </div>

        {!isAuthenticated && (
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#d1d5db' }}>
              The Gemini AI assistant is ready to help you with hardware questions. Please sign in or register to start chatting.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => navigate('/login')}
            >
              Sign in to Chat
            </button>
          </div>
        )}

        <div className="ai-chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: line ? '0.5rem' : '1rem' }}>
                  {line}
                </p>
              ))}
              {msg.createdAt && (
                <span style={{
                  display: 'block',
                  marginTop: '0.35rem',
                  fontSize: '0.7rem',
                  opacity: 0.72,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  {formatTimestamp(msg.createdAt)}
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={16} className="animate-spin" style={{ color: '#06b6d4' }} />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={() => handlePredefined("Suggest a budget gaming PC build.")}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            🎮 Budget Build
          </button>
          <button 
            onClick={() => handlePredefined("Can Ryzen 7 7800X3D work with B650 motherboard?")}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            🔧 Check AM5 Mobo
          </button>
          <button 
            onClick={() => handlePredefined("What is a good gaming GPU under Rs. 50,000?")}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ⚡ GPU under Rs. 50,000
          </button>
        </div>

        <div className="ai-history-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchHistory}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={async () => {
              setLoading(true);
              setMessages([{ role: 'ai', text: "Your chat history is cleared. Ask me anything new!" }]);
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  setMessages([{ role: 'ai', text: "Please sign in to clear your server chat history." }]);
                  return;
                }

                await aiAPI.clearHistory();
              } catch (err) {
                console.error(err);
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                  setMessages([{ role: 'ai', text: "Please sign in to clear your server chat history." }]);
                } else {
                  setMessages([{ role: 'ai', text: "Your chat history is cleared locally, but server sync failed." }]);
                }
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Clear
          </button>
        </div>

        <form className="ai-chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="input-glass" 
            placeholder={isAuthenticated ? "Ask hardware compatibility, upgrades..." : "Sign in to chat with Gemini Assistant..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !isAuthenticated}
          />
          <button type="button" className="btn-primary" style={{ padding: '0.75rem' }} disabled={loading || !isAuthenticated} onClick={handleSend}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
