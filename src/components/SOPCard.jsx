import { Link } from 'react-router-dom';
import { ArrowRightCircle, Briefcase } from 'lucide-react';

export default function SOPCard({
  sop,
  editable = false,
  showUnfavorite = false,
  onUnfavorite,
  showToggle = false,
  onToggle = () => { },
}) {
  return (
    <div className="relative border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">

      {/* ✅ Toggle 開關：絕對定位在右上角 */}
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


      {/* ✅ 標題區：獨立一區，正常換行並留右邊空間 */}
      <div className="mt-1">
        <div className="flex items-start gap-2 mb-2">
          <ArrowRightCircle className="w-5 h-5 shrink-0 text-primary mt-1" />
          <h3 className="font-semibold text-primary leading-tight line-clamp-2 break-words pr-16">
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
