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

  // 🔥 打後端 API（一次拿全部資料，前端分頁）
  async function fetchData({ keyword, dept, group }) {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (dept) queryParams.append('department', dept);
      if (group) queryParams.append('team', group);

      const url = `/api/sops/search?${queryParams.toString()}`;
      console.log('打到的完整 URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('API 呼叫失敗');
      }

      const result = await response.json();
      console.log('後端回傳的資料 result =', JSON.stringify(result, null, 2));

      setSops(result);              // 存全部資料
      setTotal(result.length);      // 用全部資料長度計算總數
    } catch (error) {
      console.error('fetch 錯誤:', error);
    } finally {
      setLoading(false);
    }
  }

  // 🔍 使用者點搜尋時
  const handleSearch = (keyword, dept, group) => {
    const query = new URLSearchParams({ keyword, dept, group, page: 1 }).toString();
    navigate(`/search?${query}`);
  };

  // 🔄 換頁
  const goToPage = (page) => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const dept = params.get('dept') || '';
    const group = params.get('group') || '';
    const query = new URLSearchParams({ keyword, dept, group, page }).toString();
    navigate(`/search?${query}`);
  };

  // 🔁 每次網址變化時（如搜尋、換頁）
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const dept = params.get('dept') || '';
    const group = params.get('group') || '';
    const page = parseInt(params.get('page')) || 1;

    fetchData({ keyword, dept, group });
    setCurrentPage(page); // 同步目前頁碼
  }, [location.search]);

  // ✂️ 前端切頁（slice）
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const visibleSops = sops.slice(startIndex, endIndex);

  return (
    <>
      <NavBar />

      <header className="bg-secondary py-12 text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">
          政大SOP整合系統 NCCU SOP Center
        </h1>
        <SearchBar
          defaultKeyword={new URLSearchParams(location.search).get('keyword') || ''}
          defaultDept={new URLSearchParams(location.search).get('dept') || ''}
          defaultGroup={new URLSearchParams(location.search).get('group') || ''}
          onSearch={handleSearch}
        />
      </header>

      <main className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-16">
              載入中...
            </div>
          ) : visibleSops.length > 0 ? (
            visibleSops.map((sop) => (
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
