import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { ArrowRightCircle, Briefcase, User, Pencil } from 'lucide-react'; // 加入 Pencil icon
=======
import { ArrowRightCircle, Briefcase, User } from 'lucide-react'; // 加入 Pencil icon
>>>>>>> main

export default function SOPCard({ sop, editable = false }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 flex flex-col justify-between h-60 max-w-xs shadow-sm hover:shadow-md transition-shadow">
      {/* 標題 */}
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

        {/* 部門資訊 */}
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span>所屬部門：{sop.department || '未指定'}</span> {/* ✅ 改這裡 */}
          </div>
        </div>
      </div>

      {/* 查看與編輯按鈕 */}
      <div className="mt-4 flex justify-center gap-3">
        <Link
<<<<<<< HEAD
          to={`/module/${sop.SOP_ID}`}
=======
         to={`/module/${sop.id}`}
>>>>>>> main
          className="bg-primary text-white px-6 py-1.5 rounded hover:bg-primary/90 text-sm"
        >
          查看
        </Link>
        {editable && (
          <Link
            to={`/module/${sop.SOP_ID}/edit`} // ⭐你可以自訂編輯路徑
            className="bg-primary text-white px-6 py-1.5 rounded hover:bg-primary/90 text-sm "
          >
            編輯
          </Link>
        )}
      </div>
    </div>
  );
}