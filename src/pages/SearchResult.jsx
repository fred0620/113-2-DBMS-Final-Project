import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import SOPCard from '../components/SOPCard';

export default function SearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sops, setSops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 8;
  const totalPages = Math.ceil(total / pageSize);

  // 🔥 這個負責打後端 API
  async function fetchData({ keyword, dept, group, page = 1 }) {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (dept) queryParams.append('department', dept);
      if (group) queryParams.append('team', group);
      queryParams.append('page', page);

      const url = `/api/sops/search?${queryParams.toString()}`;
      console.log('打到的完整 URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('API 呼叫失敗');
      }

      const result = await response.json();
      console.log('後端回傳的資料 result =', JSON.stringify(result, null, 2));

      setSops(result);
      setTotal(result.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('fetch 錯誤:', error);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 這個是 SearchBar 按搜尋時呼叫的
  const handleSearch = (keyword, dept, group) => {
    console.log('handleSearch被呼叫，參數:', keyword, dept, group);
    setCurrentPage(1); // 搜尋時回到第一頁
    const query = new URLSearchParams({ keyword, dept, group, page: 1 }).toString();
    navigate(`/search?${query}`);
  };

  // 🔥 這個是分頁按鈕用的
  const goToPage = (page) => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const dept = params.get('dept') || '';
    const group = params.get('group') || '';

    const query = new URLSearchParams({ keyword, dept, group, page }).toString();
    navigate(`/search?${query}`);
  };

  // 🔥 這個是監聽網址變化
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const dept = params.get('dept') || '';
    const group = params.get('group') || '';
    const page = parseInt(params.get('page')) || 1;
    console.log('useEffect被觸發，參數是：', { keyword, dept, group, page });
  
    // 不用判斷，直接 fetchData！
    fetchData({ keyword, dept, group, page });
  }, [location.search]);
  

  return (
    <>
      <NavBar />

      <header className="bg-secondary py-12 text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">
          政大SOP整合系統 NCCU SOP Center
        </h1>

        {/* 🔥 改這裡，傳 onSearch 進 SearchBar */}
        <SearchBar
          defaultKeyword={new URLSearchParams(location.search).get('keyword') || ''}
          defaultDept={new URLSearchParams(location.search).get('dept') || ''}
          defaultGroup={new URLSearchParams(location.search).get('group') || ''}
          onSearch={handleSearch} // ⭐⭐ 把這個傳進去
        />
      </header>

      <main className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-16">
              載入中...
            </div>
          ) : sops.length > 0 ? (
            sops.map((sop) => (
              <SOPCard key={sop.id} sop={sop} />
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

      {/* 分頁按鈕 */}
      <div className="flex justify-center items-center gap-2 mb-12">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 rounded border ${
              i + 1 === currentPage ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            onClick={() => goToPage(currentPage + 1)}
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
