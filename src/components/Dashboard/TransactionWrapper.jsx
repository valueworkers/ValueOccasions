import React, { useState, useEffect, useMemo } from 'react';
import Transaction from './Transaction';

const TransactionWrapper = () => {
  const [authUser, setAuthUser] = useState(null);
  const [subTab, setSubTab] = useState('my');

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const raw = localStorage.getItem('authUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          setAuthUser(parsed);
        } else {
          setAuthUser(null);
        }
      } catch (error) {
        setAuthUser(null);
      }
    };

    checkAuthStatus();

    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const isVsreOwner = useMemo(() => {
    return authUser?.user_type === 'VSRE_OWNER';
  }, [authUser]);

  return (
    <Transaction
      isVsreOwner={isVsreOwner}
      subTab={subTab}
      setSubTab={setSubTab}
    />
  );
};

export default TransactionWrapper;

