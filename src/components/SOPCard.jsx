import { Link } from 'react-router-dom';
import { ArrowRightCircle, Briefcase } from 'lucide-react';

export default function SOPCard({
  sop,
  editable = false,
  showUnfavorite = false,
  onUnfavorite,
  showToggle = false,
  onToggle = () => {},
}) {
  return (
    <div className="relative border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">
      {/* Toggle 開關：只在 MySOP 顯示 */}
      {showToggle && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-sm">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sop.published}
              onChange={(e) => onToggle(sop.id, e.target.checked)}
              className="form-checkbox accent-primary h-4 w-4"
            />
            <span className="ml-1 text-gray-700">{sop.published ? '公開' : '未公開'}</span>
          </label>
        </div>
      )}

      {/* 標題區 */}
      <div>
        <div className="flex items-start gap-2 mb-2">
          <ArrowRightCircle className="w-5 h-5 shrink-0 text-primary" />
          <h3 className="font-semibold text-primary leading-tight line-clamp-2">
            {sop.title}
          </h3>
        </div>

        {sop.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {sop.description}
          </p>
        )}

        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span>所屬部門：{sop.team ?? '（無資料）'}</span>
          </div>
        </div>
      </div>

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
