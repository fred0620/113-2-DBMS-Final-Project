// pages/FavoriteSOPPage.jsx
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SOPCard from '../components/SOPCard';
import { useAuth } from '../hooks/useAuth';

export default function FavoriteSOPPage() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;
  const totalPages = Math.ceil(favorites.length / pageSize);
  const currentItems = favorites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          Personal_ID: user.id,
          keyword: '',
          department: '',
          team: '',
        });
    
        const response = await fetch(`/api/sops/search?${queryParams.toString()}`);
        if (!response.ok) throw new Error('API 呼叫失敗');
        const result = await response.json();
        setFavorites(result);
      } catch (err) {
        console.error('載入收藏 SOP 失敗:', err);
      } finally {
        setLoading(false);
      }
    };    

    fetchFavorites();
  }, [user, authLoading]);

  const handleUnfavorite = async (sopId) => {
    try {
      const response = await fetch(`/api/sops/unsave`, {
        method: 'POST', // ← 正確方法
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SOP_ID: sopId,
          Personal_ID: user.id,
        }),
      });
  
      if (!response.ok) throw new Error('取消收藏 API 失敗');
  
      const result = await response.json();
      console.log('✅ 取消收藏成功:', result);
  
      // 從畫面中移除已取消收藏的 SOP
      setFavorites((prev) => prev.filter((sop) => sop.id !== sopId));
    } catch (err) {
      console.error('❌ 取消收藏失敗:', err);
    }
  };
  
  

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">收藏清單</h1> 
      </header>

      <main className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading || authLoading ? (
            <div className="col-span-full text-center text-gray-500 py-16">載入中...</div>
          ) : currentItems.length > 0 ? (
            currentItems.map((sop) => (
              <SOPCard
                key={sop.id}
                sop={sop}
                showUnfavorite={true}
                onUnfavorite={handleUnfavorite}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
              <div className="text-5xl mb-4">😔</div>
              <p className="text-lg font-medium">你還沒有收藏任何 SOP</p>
            </div>
          )}
        </div>
      </main>

      {/* 分頁 */}
      <div className="flex justify-center items-center gap-2 mb-12">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded border ${
              i + 1 === currentPage ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 rounded border bg-white text-gray-700"
          >
            下一頁 →
          </button>
        )}
      </div>

      <Footer />
    </>
  );
}
