import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightCircle, Briefcase, History } from 'lucide-react';

// ✅ 原生轉換台灣時間函式
function formatTaiwanTime(utcString) {
  if (!utcString) return '（無時間資料）';
  try {
    const date = new Date(utcString);
    // 加上 8 小時的毫秒數（8 × 60 × 60 × 1000）
    const taiwanTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);

    return `${taiwanTime.getFullYear()}/${String(taiwanTime.getMonth() + 1).padStart(2, '0')}/${String(taiwanTime.getDate()).padStart(2, '0')} ${
      taiwanTime.getHours() >= 12 ? '下午' : '上午'
    } ${String(taiwanTime.getHours() % 12 || 12).padStart(2, '0')}:${String(taiwanTime.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '（時間格式錯誤）';
  }
}


export default function SOPCard({
  sop,
  editable = false,
  showUnfavorite = false,
  onUnfavorite,
  showToggle = false,
  onToggle = () => {},
  iconMode = 'arrow', // 'arrow' | 'history'
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await fetch(`/api/sops/${sop.id}/history`);
      const data = await res.json();
      setHistoryList(data.history);
    } catch (err) {
      console.error('❌ 載入歷史版本失敗:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleHistoryClick = () => {
    setShowHistory(true);
    fetchHistory();
  };

  return (
    <div className="relative border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">
      
      {/* ✅ 歷史版本 Modal */}
      {showHistory && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-20">
          <div className="bg-white rounded-xl w-[22rem] max-h-[80%] p-5 shadow-xl overflow-y-auto border">
            <h3 className="text-xl font-bold text-primary mb-4">版本紀錄</h3>

            {isHistoryLoading ? (
              <p className="text-gray-500 text-sm text-center py-6">載入中...</p>
            ) : historyList.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">目前沒有任何歷史版本。</p>
            ) : (
              <ul className="space-y-2">
                {historyList.map(h => (
                  <li
                    key={h.version}
                    className="flex justify-between items-start p-3 rounded-md bg-gray-50 hover:bg-gray-100 border"
                  >
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800">v{h.version}</div>
                      <div className="text-xs text-gray-500">
                        {formatTaiwanTime(h.Update_Time)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/recover/${sop.id}/${h.version}`)}
                      className="text-sm text-blue-600 hover:underline mt-1"
                    >
                      查看
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowHistory(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 公開切換 */}
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
            <div className="w-9 h-5 bg-gray-300 peer-checked:bg-primary rounded-full peer-focus:ring-2 ring-primary/40 transition duration-200"></div>
            <div className="absolute left-1 top-[0.15rem] w-[0.875rem] h-[0.875rem] bg-white rounded-full shadow transform transition peer-checked:translate-x-4" />
          </label>
        </div>
      )}

      {/* ✅ 標題區 */}
      <div className="mt-1">
        <div className="flex items-start gap-2 mb-2">
          {iconMode === 'history' ? (
            <button
              onClick={handleHistoryClick}
              className="text-gray-500 hover:text-primary mt-1"
              title="版本紀錄"
            >
              <History className="w-5 h-5 shrink-0" />
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

      {/* ✅ 底部按鈕 */}
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
