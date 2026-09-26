import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

export default function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolver, setResolver] = useState(null);

  useEffect(() => {
    // signal that a provider exists
    window.__hasConfirmProvider = true;

    const handler = (e) => {
      const { message, resolve } = e.detail || {};
      if (typeof resolve !== 'function') return;
      setMessage(message || 'Are you sure?');
      setResolver(() => resolve);
      setOpen(true);
    };

    window.addEventListener('app:confirm', handler);
    return () => {
      window.removeEventListener('app:confirm', handler);
      window.__hasConfirmProvider = false;
    };
  }, []);

  const onConfirm = () => {
    if (resolver) resolver(true);
    setOpen(false);
    setResolver(null);
  };
  const onCancel = () => {
    if (resolver) resolver(false);
    setOpen(false);
    setResolver(null);
  };

  return (
    <>
      {children}
      {open && <ConfirmModal message={message} onConfirm={onConfirm} onCancel={onCancel} />}
    </>
  );
}
