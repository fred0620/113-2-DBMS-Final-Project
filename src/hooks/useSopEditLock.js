import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function useSopEditLock(sopId, user) {
  const nav   = useNavigate();
  const timer = useRef(null);

  /** 共用請求函式 ── status: updating | finish | timeout */
  const send = async (status) => {
    try {
      const res = await fetch(`${API_BASE}/api/sops/${sopId}/status`, {
        method : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          status,                               // 必填
          editor   : user?.name || 'unknown',   // ← 永遠給字串
          Admin_ID : user?.id   || 'unknown',   // ← 永遠給字串
        }),
      });

      /** 如果後端直接回 400，從這裡丟錯 */
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`HTTP ${res.status} - ${msg}`);
      }

      // 正常 JSON
      const json = await res.json();
      if (json.status === 'reject') {
        alert(`⚠ 此 SOP 正由「${json.editor}」編輯中，您無法進入編輯！`);
        nav(`/module/${sopId}`);              // 回檢視頁
      }
    } catch (err) {
      console.error('[lock] 呼叫失敗：', err);
    }
  };

  /* ───── lifecycle ───── */
  useEffect(() => {
    // 1. user 還沒載回來 → 先不送任何東西
    if (!sopId || !user) return;

    // 2. 進入頁面，送第一次 updating
    send('updating');

    // 3. 每 2 分鐘 heartbeat
    timer.current = setInterval(() => send('updating'), 120_000);

    // 4. 離開頁面 / reload → finish
    const handleUnload = () => send('finish');
    window.addEventListener('beforeunload', handleUnload);

    // 5. 清理
    return () => {
      clearInterval(timer.current);
      send('finish');
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [sopId, user]);          // ⚠ user 到了才會真的執行
}