// pages/FavoriteSOPPage.jsx
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SOPCard from '../components/SOPCard';

export default function FavoriteSOPPage() {
  console.log('⭐ FavoriteSOPPage mounted!');
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 8;
  const totalPages = Math.ceil(favorites.length / pageSize);


  useEffect(() => {
    // 🧪 暫時用 mock 資料直接塞進畫面用來測試 layout
    const mockFavorites = [
      {
        SOP_ID: 1,
        title: '請假流程',
        description: '說明如何線上申請請假並上傳附件',
        team: '人事室',
      },
      {
        SOP_ID: 2,
        title: '報帳流程',
        description: '經費報帳需準備的文件與流程',
        team: '總務處',
      },
      {
        SOP_ID: 3,
        title: '採購作業',
        description: '採購三萬以下與以上作業流程差異',
        team: '採購組',
      },
    ];
    setFavorites(mockFavorites);
  }, []);
  
  /*useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      try {
        const response = await fetch('/api/favorites');
        const result = await response.json();
        setFavorites(result);
      } catch (err) {
        console.error('載入收藏失敗:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);
*/
  const handleUnfavorite = async (id) => {
    try {
      await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
      setFavorites((prev) => prev.filter((sop) => sop.SOP_ID !== id));
    } catch (err) {
      console.error('取消收藏失敗:', err);
    }
  };

  const currentItems = favorites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">我的 SOP 收藏</h1>
      </header>

      <main className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-16">載入中...</div>
          ) : currentItems.length > 0 ? (
            currentItems.map((sop) => (
              <SOPCard key={sop.SOP_ID} sop={sop} onUnfavorite={handleUnfavorite} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
              <div className="text-5xl mb-4">😔</div>
              <p className="text-lg font-medium">目前沒有收藏的 SOP</p>
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
