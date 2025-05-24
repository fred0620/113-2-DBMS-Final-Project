import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth'; 

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EditSOPPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // 取得登入者資訊

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/api/sops/${id}/flowchart`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json?.data ?? json;

        console.debug('[EditSOP] flowchart data', data);

        setTitle(data.title ?? data.SOP_Name ?? '未命名 SOP');
        setDesc(data.description ?? data.SOP_Content ?? '');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[EditSOP] 讀取失敗：', err);
          setError(`⚠ 無法讀取 SOP 資料（${err.message}）`);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('SOP 名稱為必填');
      return;
    }

    if (!user || authLoading) {
      alert('使用者資訊尚未載入，請稍後再試');
      return;
    }
    console.log("user", user);
    try {
      setSaving(true);
      const payload = {
        SOP_ID: id,
        SOP_Name: title.trim(),
        SOP_Content: desc.trim(),
        Team_in_charge: teamId,
        Updated_by: user.username
      };


      console.log('[送出 payload]', payload);

      const res = await fetch(`${API_BASE}/api/sops/${id}/info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      navigate(`/module/${id}/edit`);
    } catch (err) {
      console.error('[EditSOP] 儲存錯誤：', err);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (<><NavBar /><div className="text-center py-20">載入中…</div><Footer /></>);
  if (error) return (<><NavBar /><div className="text-center py-20 text-red-600">{error}</div><Footer /></>);

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-3xl font-bold text-primary">{title.trim() || '未命名 SOP'}</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <label className="block font-semibold mb-1">
            SOP 名稱 <span className="text-red-600">*</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={30}
            placeholder="請輸入 SOP 名稱"
            className="border rounded w-full px-4 py-2"
          />
          <p className="text-xs text-gray-400 mt-1">最多 30 字</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">SOP 簡介</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={6}
            placeholder="請輸入 SOP 簡介"
            className="border rounded w-full px-4 py-2 resize-none"
          />
        </div>

        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded text-sm"
          >
            ← 回上一頁
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary text-white px-8 py-2 rounded hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? '儲存中…' : '進入 Module 編輯頁'}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}