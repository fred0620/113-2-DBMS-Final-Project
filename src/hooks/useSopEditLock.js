import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function useSopEditLock(sopId, user) {
  const nav = useNavigate();
  const timer = useRef(null);
  const [locked, setLocked] = useState(false);

  const send = async (status) => {
    try {
      const res = await fetch(`${API_BASE}/api/sops/${sopId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,                        // 'updating' or 'finish'
          edit_name: user?.username || 'unknown',
          editor_id: user?.adminId || 'unknown',
        }),
      });

      const json = await res.json();

      // 被拒絕編輯時的回應處理
      if (json.status === 'reject') {
        alert(`⚠ 此 SOP 正由「${json.edit_name}」編輯中，您無法進入編輯！`);
        setLocked(true);
        nav(`/module/${sopId}`); // 導回檢視頁
      }
    } catch (err) {
      console.error('[lock] 呼叫失敗：', err);
    }
  };

  useEffect(() => {
    if (!sopId || !user?.id || !user?.name) return;

    send('updating'); // 初次上鎖
    timer.current = setInterval(() => send('updating'), 120_000); // 每 2 分鐘心跳

    const handleUnload = () => send('finish');
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(timer.current);
      send('finish');
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [sopId, user?.id, user?.name]);

  return locked;
}
