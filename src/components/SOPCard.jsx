import { Link } from 'react-router-dom';
import { ArrowRightCircle, Briefcase } from 'lucide-react';

<<<<<<< HEAD
export default function SOPCard({ sop, editable = false, showUnfavorite = false, onUnfavorite }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">
      {/* 標題 */}
=======
export default function SOPCard({ sop, editable = false }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">
      {/* 標題區 */}
>>>>>>> feature/frontend/my-sop
      <div>
        <div className="flex items-start gap-2 mb-2">
          <ArrowRightCircle className="w-5 h-5 shrink-0 text-primary" />
          <h3 className="font-semibold text-primary leading-tight line-clamp-2">
            {sop.title}
          </h3>
        </div>

        {/* 簡介 */}
        {sop.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {sop.description}
          </p>
        )}

<<<<<<< HEAD
        {/* 部門資訊 */}
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span>所屬部門：{sop.department || '未指定'}</span>
=======
        {/* 額外資訊 */}
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span>所屬部門：{sop.team}</span>
>>>>>>> feature/frontend/my-sop
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* 查看／編輯／取消收藏 */}
      <div className="mt-4 flex justify-center gap-3 flex-wrap">
=======
      {/* 查看 / 編輯按鈕 */}
      <div className="mt-4 flex justify-center gap-3">
>>>>>>> feature/frontend/my-sop
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