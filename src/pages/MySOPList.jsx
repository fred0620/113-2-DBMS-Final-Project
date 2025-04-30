import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SOPCard from '../components/SOPCard';
import { useAuth } from '../hooks/useAuth';

/**
 * MySOPList
 * - 專屬登入者的 SOP 一覽
 * - 預設以使用者部門 / 組別為固定篩選條件
 * - 提供關鍵字搜尋 + 分頁
 */

export default function MySOPList() {
    const { user, loading: isAuthLoading } = useAuth();

    const [keyword, setKeyword] = useState('');
    const [sops, setSops] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const pageSize = 8;
    const totalPages = Math.ceil(total / pageSize);

    useEffect(() => {
        if (user) fetchSops({ keyword: '', page: 1 });
    }, [user]);

    if (isAuthLoading || !user) {
        return (
            <>
                <NavBar />
                <div className="text-center py-20 text-gray-600 text-lg">載入使用者資訊中...</div>
                <Footer />
            </>
        );
    }

    const fetchSops = async ({ keyword, page }) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.append('keyword', keyword);
            if (user.department) queryParams.append('department', user.department);
            if (user.team) queryParams.append('team', user.team);
            queryParams.append('page', page);

            const url = `/api/sops/search?${queryParams.toString()}`;
            console.log('打到的完整 URL:', url);

            const res = await fetch(url);
            if (!res.ok) throw new Error('API 呼叫失敗');

            const result = await res.json();
            console.log('後端回傳的資料 result =', result);

            setSops(Array.isArray(result) ? result : []);
            setTotal(Array.isArray(result) ? result.length : 0);
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

    return (
        <>
            <NavBar />

            <header className="bg-secondary py-12 text-center">
                <h1 className="text-3xl font-bold text-primary mb-2">我的 SOP</h1>
                <p className="text-lg">所屬部門： {user.team}</p>

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

            <main className="py-10 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        <div className="col-span-full text-center text-gray-500 py-16">
                            載入中...
                        </div>
                    ) : sops.length > 0 ? (
                        sops.map((sop) => (
                            <SOPCard key={sop.id} sop={sop} editable />
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
                            <div className="text-5xl mb-4">😔</div>
                            <p className="text-lg font-medium">找不到符合條件的 SOP</p>
                            <p className="text-sm mt-2">請嘗試調整搜尋關鍵字或篩選條件</p>
                        </div>
                    )}
                </div>
            </main>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-12">
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
