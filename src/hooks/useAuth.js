import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 模擬 async 登入流程
  useEffect(() => {
    const fakeUser = {
      name: '測試使用者',
      role: 'admin',
      department: '秘書處',
      team: '秘書處第三組',
    };

    const timer = setTimeout(() => {
      setUser(fakeUser);
      setLoading(false);
    }, 500); 

    return () => clearTimeout(timer);
  }, []);

  return { user, loading };
}