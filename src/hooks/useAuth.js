import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fakeUser = {
      name: '302912',             // ✅ 改成存在於 Administrator 資料表中的 ID
      role: 'admin',
      department: '秘書處',
      team: 'Q03',                  // ✅ 改成 Team_ID，不是中文名稱
      teamName: '秘書處第三組',     // ✅ 額外提供顯示用名稱（非必要）
    };

    const timer = setTimeout(() => {
      setUser(fakeUser);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { user, loading };
}