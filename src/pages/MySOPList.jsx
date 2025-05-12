import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar   from '../components/NavBar';
import Footer   from '../components/Footer';
import SOPCard  from '../components/SOPCard';
import { useAuth } from '../hooks/useAuth';

export default function MySOPList() {
  const { user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  /* ---------- 狀態 ---------- */
  const [keyword,      setKeyword]      = useState('');
  const [sops,         setSops]         = useState([]);
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [isLoading,    setIsLoading]    = useState(false);

  const [newTitle,     setNewTitle]     = useState('');
  const [newDesc ,     setNewDesc ]     = useState('');
  const [isCreating,   setIsCreating]   = useState(false);

  const pageSize   = 8;
  const totalPages = Math.ceil(total / pageSize);

  /* ---------- 取得 SOP 清單 ---------- */
  useEffect(() => {
    if (user) fetchSops({ keyword: '', page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSops = async ({ keyword, page }) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (keyword)         qs.append('keyword', keyword);
      if (user.department) qs.append('department', user.department);
      if (user.team)       qs.append('team', user.team);
      qs.append('page', page);

      const res  = await fetch(`/api/sops/search?${qs.toString()}`);
      if (!res.ok) throw new Error('API 失敗');
      const list = await res.json();

      /* -------- 统一欄位命名 -------- */
      const normalize = (item) => ({
        id         : item.id          ?? item.SOP_ID,
        title      : item.title       ?? item.SOP_Name,
        description: item.description ?? item.SOP_Content,
        department : item.department  ?? item.Team_in_charge,
        // 其餘需要的欄位再補
      });

      const formatted = Array.isArray(list) ? list.map(normalize) : [];
      setSops(formatted);
      setTotal(formatted.length);
      setPage(page);
    } catch (err) {
      console.error('[MySOP] fetch error', err);
      setSops([]); setTotal(0);
    } finally { setIsLoading(false); }
  };

  /* ---------- 分頁 & 搜尋 ---------- */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSops({ keyword, page: 1 });
  };
  const handlePageClick = (next) => {
    if (next < 1 || next > totalPages || next === page) return;
    fetchSops({ keyword, page: next });
  };

  /* ---------- 新增 SOP → 轉到 ModuleCreatePage ---------- */
  const handleCreateSop = async () => {
    if (!newTitle.trim()) { alert('請輸入 SOP 標題'); return; }

    try {
      setIsCreating(true);

      const res = await fetch('/api/sops/create', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          SOP_Name      : newTitle,
          SOP_Content   : newDesc,
          Team_in_charge: user.team,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Create failed');
      }

      const json      = await res.json();
      const newSopId  = json?.sop?.id || json?.data?.SOP_ID;

      navigate(`/module/${newSopId}/create`);
    } catch (err) {
      console.error('Create SOP error：', err.message);

      /* 開發階段臨時跳轉 */
      navigate(`/module/TEMP-ID/create`);
    } finally {
      setIsCreating(false);
    }
  };

  /* ---------- UI ---------- */
  if (isAuthLoading || !user) {
    return (
      <>
        <NavBar />
        <div className="text-center py-20 text-gray-600">載入使用者資訊中…</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />

      {/* ======= 頂部搜尋區 ======= */}
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">我的 SOP</h1>
        <p className="text-lg">所屬部門：{user.team}</p>

        <form onSubmit={handleSearchSubmit}
              className="mt-8 flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
          <div className="relative w-full">
            <input
              value={keyword}
              onChange={(e)=>setKeyword(e.target.value)}
              placeholder="輸入關鍵字搜尋…"
              className="w-full border rounded px-4 py-2 pr-10"/>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 106.75 6.75a7.5 7.5 0 009.9 9.9z"/>
            </svg>
          </div>
          <button type="submit"
                  disabled={isLoading}
                  className="bg-primary text-white px-10 py-2 rounded disabled:opacity-70">
            搜尋
          </button>
        </form>
      </header>

      {/* ======= SOP Cards ======= */}
      <main className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? <div className="col-span-full text-center text-gray-500 py-16">載入中…</div>
            : sops.length
              ? sops.map((s)=><SOPCard key={s.id} sop={s} editable/>)
              : <div className="col-span-full flex flex-col items-center text-gray-500 py-16">
                  <div className="text-5xl mb-4">😔</div>
                  <p className="text-lg font-medium">找不到符合條件的 SOP</p>
                  <p className="text-sm mt-2">請嘗試其他關鍵字或條件</p>
                </div>}
        </div>

        {/* ======= 新增 SOP ======= */}
        <div className="bg-white border shadow-sm rounded-lg p-10 mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">新增 SOP</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold mb-1">標題</label>
              <input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)}
                     placeholder="輸入 SOP 標題"
                     className="border w-full rounded px-4 py-2 text-sm"/>
              <p className="text-xs text-gray-400 mt-1">必填(最多 30 字)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">簡介</label>
              <textarea rows={5}
                        value={newDesc}
                        onChange={(e)=>setNewDesc(e.target.value)}
                        placeholder="輸入 SOP 簡介"
                        className="border w-full rounded px-4 py-2 text-sm resize-none"/>
            </div>
          </div>

          <button onClick={handleCreateSop}
                  disabled={!newTitle.trim() || isCreating}
                  className="bg-primary text-white px-10 py-3 rounded mt-8 hover:bg-primary/90 disabled:opacity-50 block mx-auto">
            進入 Module 新增頁面
          </button>
        </div>
      </main>

      {/* ======= Pagination ======= */}
      {totalPages > 1 &&
        <div className="flex justify-center gap-2 mt-10 mb-20">
          {Array.from({length: totalPages},(_,i)=>i+1).map(i=>(
            <button key={i} onClick={()=>handlePageClick(i)}
              className={`px-3 py-1 rounded border ${i===page?'bg-primary text-white':'bg-white text-gray-700'}`}>
              {i}
            </button>
          ))}
          {page < totalPages &&
            <button onClick={()=>handlePageClick(page+1)}
                    className="px-3 py-1 rounded border bg-white text-gray-700">
              下一頁 →
            </button>}
        </div>}
      <Footer />
    </>
  );
}