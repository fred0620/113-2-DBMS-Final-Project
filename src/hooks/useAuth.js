import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('❌ 無法解析 user:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserFromStorage();

    // ✅ 監聽 custom event（跨元件通知更新 user 狀態）
    const handleLogin = () => loadUserFromStorage();
    window.addEventListener('user-login', handleLogin);
    window.addEventListener('user-logout', handleLogin);

    return () => {
      window.removeEventListener('user-login', handleLogin);
      window.removeEventListener('user-logout', handleLogin);
    };
  }, []);

  return { user, loading };
}
