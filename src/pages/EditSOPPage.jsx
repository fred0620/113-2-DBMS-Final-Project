import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function EditSOPPage() {
  const { id } = useParams();          // /sop/:id/edit
  const navigate = useNavigate();

  /* ===== 目前欄位 ===== */
  const [title, setTitle] = useState('');
  const [desc , setDesc ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving , setSaving ] = useState(false);

  /* ===== 讀取 SOP 基本資料 ===== */
  useEffect(() => {
    async function fetchBasic() {
      try {
        /* ❗ TODO：後端完成後 → 確認路徑與回傳欄位 */
        const res  = await fetch(`/api/sops/${id}`);
        if (!res.ok) throw new Error('API 失敗');
        const json = await res.json();

        setTitle(json.SOP_Name     ?? '未命名 SOP');
        setDesc (json.SOP_Content  ?? '');
      } catch (err) {
        console.error('[EditSOP] 讀取失敗：', err.message);

        /* ➜ 假資料 (後端完成後可刪) */
        setTitle('未命名 SOP');
        setDesc('（尚未填寫簡介…）');
      } finally {
        setLoading(false);
      }
    }
    fetchBasic();
  }, [id]);

  /* ===== 送出並跳轉 ===== */
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('SOP 名稱為必填');
      return;
    }

    try {
      setSaving(true);

      /* ❗ TODO：後端完成後 → 改成真正更新 API */
      const res = await fetch(`/api/sops/${id}`, {
        method : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ title, description: desc })
      });
      if (!res.ok) throw new Error('更新失敗');

      navigate(`/module/${id}/edit`);
    } catch (err) {
      console.error('[EditSOP] 儲存錯誤：', err.message);

      /* ➜ 模擬跳轉 (後端完成後可移除) */
      navigate(`/module/${id}/edit`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="text-center py-20">載入中…</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />

      {/* ==== 頂端區塊：顯示 SOP 名稱 ==== */}
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-3xl font-bold text-primary">
          {title || '未命名 SOP (編輯中)'}
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        {/* ====== SOP 名稱 ====== */}
        <div>
          <label className="block font-semibold mb-1">
            SOP 名稱 <span className="text-red-600">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="請輸入 SOP 名稱"
            className="border rounded w-full px-4 py-2"
          />
          <p className="text-xs text-gray-400 mt-1">最多 30 字</p>
        </div>

        {/* ====== SOP 簡介 ====== */}
        <div>
          <label className="block font-semibold mb-1">SOP 簡介</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="請輸入 SOP 簡介"
            rows={6}
            className="border rounded w-full px-4 py-2 resize-none"
          />
        </div>

        {/* ==== 按鈕列（並排） ==== */}
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