import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({
  defaultKeyword = '',
  defaultDept = '',
  defaultGroup = '',
  onSearch, // 允許外面傳onSearch，但也可以不傳
}) {
  const navigate = useNavigate(); // 🔥自己也能 navigate
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [dept, setDept] = useState(defaultDept);
  const [group, setGroup] = useState(defaultGroup);

  const groupOptions = {
    "主計室": [
      "主計室第一組",
      "主計室第二組",
      "主計室第三組"
    ],
    "總務處": [
      "總務處文書組",
      "總務處事務組",
      "總務處財產組",
      "總務處營繕組",
      "總務處出納組",
      "總務處環境保護與職業安全衛生組",
      "總務處校園規劃與發展組"
    ],
    "學生事務處": [
      "學生事務處生活事務暨僑生輔導組",
      "學生事務處課外活動組",
      "學生事務處住宿輔導組",
      "學生事務處學生安全輔導組",
      "學生事務處藝文中心",
      "學生事務處職業生涯發展中心",
      "學生事務處身心健康中心"
    ],
    "人事室": [
      "人事室第一組",
      "人事室第二組",
      "人事室第三組",
      "人事室第四組"
    ],
    "秘書處": [
      "秘書處第一組",
      "秘書處第二組",
      "秘書處第三組"
    ],
    "教務處": [
      "教務處註冊組",
      "教務處課務組",
      "教務處綜合業務組",
      "教務處通識教育中心",
      "教務處教學發展中心"
    ],
    "商學院": [
      "金融學系",
      "資訊管理學系",
      "財務管理學系"
    ]
  };


  const triggerSearch = () => {
    console.log('triggerSearch 被呼叫');

    if (onSearch) {
      // 🔥 如果有外面傳進來的 onSearch，就呼叫它
      onSearch(keyword, dept, group);
    } else {
      // 🔥 如果沒有，就自己導航到 /search
      const query = new URLSearchParams({ keyword, dept, group, page: 1 }).toString();
      navigate(`/search?${query}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* 關鍵字輸入 */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="請輸入關鍵字查找SOP..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full border rounded px-4 py-2 pr-10"
        />
        {/* 搜尋icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.75 6.75a7.5 7.5 0 0 0 9.9 9.9z"
          />
        </svg>
      </div>

      {/* 部門+組別選單 */}
      <div className="flex gap-4 justify-center">
        <select
          value={dept}
          onChange={(e) => {
            setDept(e.target.value);
            setGroup(''); // 部門改了，組別清空
          }}
          className="w-48 md:w-56 border rounded px-3 py-2"
        >
          <option value="">SOP所屬部門</option>
          <option value="主計室">主計室</option>
          <option value="總務處">總務處</option>
          <option value="學生事務處">學生事務處</option>
          <option value="人事室">人事室</option>
          <option value="教務處">教務處</option>
        </select>

        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-48 md:w-56 border rounded px-3 py-2"
        >
          <option value="">SOP組別</option>
          {(
            dept === ''
              ? Object.values(groupOptions).flat()
              : groupOptions[dept] || []
          ).map((groupName) => (
            <option key={groupName} value={groupName}>
              {groupName}
            </option>
          ))}
        </select>

      </div>

      {/* 搜尋按鈕 */}
      <button
        onClick={triggerSearch}
        className="self-center bg-primary text-white px-10 py-2 rounded"
      >
        搜尋
      </button>
    </div>
  );
}
