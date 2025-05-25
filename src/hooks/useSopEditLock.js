import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function useSopEditLock(sopId, user) {
  const nav = useNavigate();
  const timer = useRef(null);
  const [locked, setLocked] = useState(false); // ← 新增鎖定狀態

  const send = async (status) => {
    try {
      const res = await fetch(`${API_BASE}/api/sops/${sopId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          editor: user?.name || 'unknown',
          Admin_ID: user?.id || 'unknown',
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`HTTP ${res.status} - ${msg}`);
      }

      const json = await res.json();
      if (json.status === 'reject') {
        alert(`⚠ 此 SOP 正由「${json.editor}」編輯中，您無法進入編輯！`);
        setLocked(true);                      // ← 被鎖定
        nav(`/module/${sopId}`);              // ← 回到檢視頁
      }
    } catch (err) {
      console.error('[lock] 呼叫失敗：', err);
    }
  };

  useEffect(() => {
    // ✅ 等待 user 完整載入再執行
    if (!sopId || !user?.id || !user?.name) return;

    send('updating'); // 第一次更新狀態

    // Heartbeat 每 2 分鐘
    timer.current = setInterval(() => send('updating'), 120_000);

    // unload 時清除
    const handleUnload = () => send('finish');
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(timer.current);
      send('finish');
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [sopId, user?.id, user?.name]); // ← 僅當完整 user 到位才執行

  return locked; // ← 傳回是否被鎖住
}