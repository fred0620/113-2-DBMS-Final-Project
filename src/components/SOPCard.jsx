import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightCircle, Briefcase, History } from 'lucide-react';

export default function SOPCard({
  sop,
  editable = false,
  showUnfavorite = false,
  onUnfavorite,
  showToggle = false,
  onToggle = () => { },
  iconMode = 'arrow', // 'arrow' | 'history'
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/sops/${sop.id}/history`);
      const data = await res.json();
      setHistoryList(data.history);
    } catch (err) {
      console.error('❌ 載入歷史版本失敗:', err);
    }
  };

  const handleHistoryClick = () => {
    setShowHistory(true);
    fetchHistory();
  };

  return (
    <div className="relative border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">

      {/* ✅ 顯示歷史版本 Modal */}
      {showHistory && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white rounded p-4 w-80 max-h-[80%] overflow-y-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-primary">版本紀錄</h3>
            <ul className="space-y-2 text-sm">
              {historyList.map(h => (
                <li
                  key={h.version}
                  className="flex justify-between items-start border-b pb-1"
                >
                  <div>
                    <span className="block font-medium">v{h.version}</span>
                    <span className="block text-gray-500 text-xs">
                      {h.Update_Time
                        ? new Date(h.Update_Time).toLocaleString("zh-TW", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "（無時間資料）"}
                    </span>
                  </div>
                  <button
                    className="text-blue-600 hover:underline text-sm mt-1"
                    onClick={() => navigate(`/recover/${sop.id}/${h.version}`)}
                  >
                    查看
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toggle 開關：右上角 */}
      {showToggle && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs z-10">
          <span className="text-gray-500 whitespace-nowrap">
            {sop.published === 'publish' ? '公開' : '未公開'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sop.published === 'publish'}
              onChange={(e) =>
                onToggle(sop.id, e.target.checked ? 'publish' : 'unpublish')
              }
              className="sr-only peer"
            />
            {/* 背景條 */}
            <div className="w-9 h-5 bg-gray-300 peer-checked:bg-primary rounded-full peer-focus:ring-2 ring-primary/40 transition duration-200"></div>
            {/* 滑動圓點 */}
            <div className="absolute left-1 top-[0.15rem] w-[0.875rem] h-[0.875rem] bg-white rounded-full shadow transform transition peer-checked:translate-x-4" />
          </label>
        </div>
      )}

      {/* ✅ 標題區（icon 與標題同行） */}
      <div className="mt-1">
        <div className="flex items-start gap-2 mb-2">
          {iconMode === 'history' ? (
            <button
              onClick={handleHistoryClick}
              className="text-gray-500 hover:text-primary mt-1"
              title="版本紀錄"
            >
              <History className="w-5 h-5 shrink-0 " />
            </button>
          ) : (
            <ArrowRightCircle className="w-5 h-5 shrink-0 text-primary mt-[2px]" />
          )}
          <h3
            className={`font-semibold text-primary leading-tight line-clamp-2 break-words ${showToggle ? 'pr-16' : 'pr-0'}`}
          >
            {sop.title}
          </h3>
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span>所屬部門：{sop.team ?? '（無資料）'}</span>
          </div>
        </div>
      </div>

      {/* ✅ 底部按鈕列 */}
      <div className="mt-4 flex justify-center gap-3 flex-wrap">
        <Link
          to={`/module/${sop.id}`}
          className="bg-primary text-white px-6 py-1.5 rounded hover:bg-primary/90 text-sm"
        >
          查看
        </Link>

        {editable && (
          <Link
            to={`/module/${sop.id}/edit`}
            className="bg-primary text-white px-6 py-1.5 rounded hover:bg-primary/90 text-sm"
          >
            編輯
          </Link>
        )}

        {showUnfavorite && (
          <button
            onClick={() => onUnfavorite(sop.id)}
            className="bg-primary text-white px-6 py-1.5 rounded hover:bg-primary/90 text-sm"
          >
            取消收藏
          </button>
        )}
      </div>
    </div>
  );
}
