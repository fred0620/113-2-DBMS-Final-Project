import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SOPCard from '../components/SOPCard';
import { useAuth } from '../hooks/useAuth';


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
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const pageSize = 8;
    const totalPages = Math.ceil(total / pageSize);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            alert("請選擇起訖日期");
            return;
        }

        try {
            const params = new URLSearchParams({
                teamName: user.team, // 🔸 注意：這是你登入者的 team
                start_time: startDate,
                end_time: endDate
            });

            const response = await fetch(`/api/report/export?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            });

            if (!response.ok) throw new Error("報表下載失敗");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", `SOP_Report_${user.team}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("❌ 產生報表錯誤:", err);
            alert("下載失敗，請稍後再試");
        }
    };


    /* ---------------- 取資料 ---------------- */
    const fetchSops = async ({ keyword, pageNum }) => {
        setIsLoading(true);
        try {
            const qs = new URLSearchParams();
            if (keyword.trim()) qs.append('keyword', keyword.trim());
            qs.append('team', user.team);          // 傳 Q03（Team_ID）
            qs.append('page', 'my');
            qs.append('pageNum', pageNum);

            const res = await fetch(`/api/sops/search?${qs}`);
            if (!res.ok) throw new Error('API 呼叫失敗');

            const result = await res.json();

            const normalize = (item) => ({
                id: item.id ?? item.SOP_ID,
                title: item.title ?? item.SOP_Name,
                description: item.description ?? item.SOP_Content,
                team: item.team ?? item.Team_Name ?? item.Team_in_charge,
                status: item.status,           // 🔒 新增鎖定狀態欄位
                editor: item.edit_name,        // 🔒 新增編輯者欄位
                published: item.is_publish, // ← 改這行
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

    useEffect(() => {
        if (!isAuthLoading && user) fetchSops({ keyword: '', pageNum: 1 });
    }, [user, isAuthLoading]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchSops({ keyword, pageNum: 1 });
    };

    const handlePageClick = (next) => {
        if (next < 1 || next > totalPages || next === page) return;
        fetchSops({ keyword, pageNum: next });
    };

  const handleCreateSop = async () => {
    if (!newTitle.trim()) return alert('請輸入 SOP 標題');

    try {
      setIsCreating(true);
      const res = await fetch('/api/sops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SOP_Name: newTitle,
          SOP_Content: newDesc,
          Team_in_charge: user.team,
          Created_by: user.adminId
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
  const handleTogglePublish = async (sopId, nextStatus) => {
    try {
      const response = await fetch(`/api/sops/${sopId}/update_publish?is_publish=${nextStatus}`, {
        method: 'PUT',
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '更新失敗');
  
      console.log('✅ 發佈狀態更新成功:', result);
  
      setSops((prev) =>
        prev.map((sop) =>
          sop.id === sopId ? { ...sop, published: nextStatus } : sop
        )
      );
    } catch (err) {
      console.error('❌ 發佈狀態更新失敗:', err.message);
    }
  };
  


    if (isAuthLoading || !user)
        return (
            <>
                <NavBar />
                <div className="text-center py-20 text-gray-600 text-lg">
                    載入使用者資訊中...
                </div>
                <Footer />
            </>
        );
  
    return (
        <>
            <NavBar />
            <header className="bg-secondary py-12 text-center">
                <h1 className="text-3xl font-bold text-primary mb-2">我的 SOP</h1>
                <p className="text-lg">
                    所屬部門：{user.teamName ?? user.team}
                </p>

                <form
  onSubmit={handleSearchSubmit}
  className="mt-8 flex flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto"
>
  <input
    value={keyword}
    onChange={(e) => setKeyword(e.target.value)}
    placeholder="輸入關鍵字搜尋..."
    className="flex-grow border rounded px-4 py-2"
  />
  <button
    type="submit"
    disabled={isLoading}
    className="bg-primary text-white px-6 py-2 rounded disabled:opacity-70 whitespace-nowrap"
  >
    搜尋
  </button>
</form>


                <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">從</label>
                            <input
                                type="date"
                                className="border rounded px-3 py-2 text-sm"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">至</label>
                            <input
                                type="date"
                                className="border rounded px-3 py-2 text-sm"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button
                            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
                            onClick={handleGenerateReport}
                        >
                            📄 產生報表
                        </button>
                    </div>
                </div>


            </header>

            <main className="py-10 px-6 max-w-7xl mx-auto">
                {/* 卡片區 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        <div className="col-span-full text-center text-gray-500 py-16">
                            載入中...
                        </div>
                    ) : sops.length ? (
                        sops.map((sop) => <SOPCard key={sop.id} sop={sop} editable showToggle
                            onToggle={handleTogglePublish} iconMode="history" />)
                    ) : (
                        <div className="col-span-full flex flex-col items-center text-gray-500 py-16">
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
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="輸入 SOP 標題" className="border w-full rounded px-4 py-2 text-sm" />
              <p className="text-xs text-gray-400 mt-1">最多 30 字</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">簡介</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="輸入 SOP 簡介" rows={5} className="border w-full rounded px-4 py-2 text-sm resize-y" />
            </div>
          </div>
          <AlertDialog.Root open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <AlertDialog.Trigger asChild>
              <button disabled={!newTitle.trim() || isCreating} className="bg-primary text-white px-10 py-3 rounded mt-8 hover:bg-primary/90 disabled:opacity-50 block mx-auto">
                進入 Module 新增頁面
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
              <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[400px] z-50">
                <AlertDialog.Title className="text-lg font-bold mb-2">確定要進入 Module 新增頁面？</AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-gray-600">
                  進入後將無法返回 SOP 標題與簡介頁面。是否繼續？
                </AlertDialog.Description>
                <div className="flex justify-end gap-3 mt-6">
                  <AlertDialog.Cancel asChild>
                    <button className="px-4 py-2 border rounded text-sm">取消</button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button onClick={handleCreateSop} className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90">確認</button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      </main>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 mb-20">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => handlePageClick(i + 1)} className={`px-3 py-1 rounded border ${i + 1 === page ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>{i + 1}</button>
          ))}
          {page < totalPages && (
            <button onClick={() => handlePageClick(page + 1)} className="px-3 py-1 rounded border bg-white text-gray-700">下一頁 →</button>
          )}
        </div>
      )}
      <Footer />
    </>
  );
}
