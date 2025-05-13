import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SOPCard from '../components/SOPCard';
import { useAuth } from '../hooks/useAuth';

/**
 * MySOPList
 * - 專屬登入者的 SOP 一覽
 * - 預設以使用者部門 / 組別為固定篩選條件
 * - 提供關鍵字搜尋 + 分頁 + 新增 SOP
 */

export default function MySOPList() {
  const { user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [sops, setSops] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const pageSize = 8;
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    if (user) fetchSops({ keyword: '', page: 1 });
  }, [user]);

  const fetchSops = async ({ keyword, page }) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (keyword) qs.append('keyword', keyword);
      if (user.department) qs.append('department', user.department);
      if (user.team) qs.append('team', user.team);
      qs.append('page', page);

      const res = await fetch(`/api/sops/search?${qs.toString()}`);
      if (!res.ok) throw new Error('API 呼叫失敗');

      const result = await res.json();
      const normalize = (item) => ({
        id: item.id ?? item.SOP_ID,
        title: item.title ?? item.SOP_Name,
        description: item.description ?? item.SOP_Content,
        department: item.department ?? item.Team_in_charge,
      });

      const formatted = Array.isArray(result) ? result.map(normalize) : [];
      setSops(formatted);
      setTotal(formatted.length);
      setPage(page);
    } catch (err) {
      console.error('[MySOP] fetch error', err);
      setSops([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSops({ keyword, page: 1 });
  };

  const handlePageClick = (next) => {
    if (next < 1 || next > totalPages || next === page) return;
    fetchSops({ keyword, page: next });
  };

  const handleCreateSop = async () => {
    if (!newTitle.trim()) {
      alert('請輸入 SOP 標題');
      return;
    }
    try {
      setIsCreating(true);
      const res = await fetch('/api/sops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SOP_Name: newTitle,
          SOP_Content: newDesc,
          Team_in_charge: user.team,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '新增失敗');

      const newSopId = json.sop?.id || json.data?.SOP_ID;
      navigate(`/module/${newSopId}/create`);
    } catch (err) {
      console.error('新增失敗，進入模擬模式：', err.message);
      navigate(`/module/TEMP-ID/create`);
    } finally {
      setIsCreating(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <>
        <NavBar />
        <div className="text-center py-20 text-gray-600 text-lg">載入使用者資訊中...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">我的 SOP</h1>
        <p className="text-lg">所屬部門：{user.team}</p>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-8 flex flex-col items-center gap-4 w-full max-w-xl mx-auto"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="輸入關鍵字搜尋..."
            className="w-full border rounded px-4 py-2"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white px-10 py-2 rounded disabled:opacity-70"
          >
            搜尋
          </button>
        </form>
      </header>

      <main className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-500 py-16">載入中...</div>
          ) : sops.length > 0 ? (
            sops.map((sop) => <SOPCard key={sop.id} sop={sop} editable />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
              <div className="text-5xl mb-4">😔</div>
              <p className="text-lg font-medium">找不到符合條件的 SOP</p>
              <p className="text-sm mt-2">請嘗試調整搜尋關鍵字或篩選條件</p>
            </div>
          )}
        </div>

        <div className="bg-white border shadow-sm rounded-lg p-10 mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">新增 SOP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold mb-1">標題</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="輸入 SOP 標題"
                className="border w-full rounded px-4 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">最多 30 字</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">簡介</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="輸入 SOP 簡介"
                rows={5}
                className="border w-full rounded px-4 py-2 text-sm resize-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreateSop}
            disabled={!newTitle.trim() || isCreating}
            className="bg-primary text-white px-10 py-3 rounded mt-8 hover:bg-primary/90 disabled:opacity-50 block mx-auto"
          >
            進入 Module 新增頁面
          </button>
        </div>
      </main>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 mb-20">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageClick(i + 1)}
              className={`px-3 py-1 rounded border ${
                i + 1 === page ? 'bg-primary text-white' : 'bg-white text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {page < totalPages && (
            <button
              onClick={() => handlePageClick(page + 1)}
              className="px-3 py-1 rounded border bg-white text-gray-700"
            >
              下一頁 →
            </button>
          )}
        </div>
      )}

      <Footer />
    </>
  );
}
