import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

// Mock data (用 props 或 API 傳入)
const mockSOP = {
  title: '大學生退學SOP',
  description: '詳細說明文字',
  department: '學務處',
  owner: '王小明',
  steps: [
    { id: '1', label: 'STEP1' },
    { id: '2', label: 'STEP2' },
    { id: '3-1', label: 'STEP3.1' },
    { id: '3-2', label: 'STEP3.2' }
  ],
  edges: [
    { from: '1', to: '2' },
    { from: '2', to: '3-1' },
    { from: '2', to: '3-2' }
  ]
};

export default function SOPDetailHorizontal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collected, setCollected] = useState(false);

  const handleCollect = () => {
    setCollected(true);
    // 可串接收藏 API
    console.log('SOP 收藏中…');
  };

  return (
    <>
      <NavBar />
      <main className="bg-secondary py-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          {mockSOP.title}
        </h1>
      </main>

      {/* 左上角說明卡片 */}
      <div className="flex items-start gap-8 max-w-6xl mx-auto px-6 mt-8">
        <div className="w-1/4 flex flex-col gap-4">
          <div className="border rounded p-4 bg-white shadow-sm text-sm">
            <p className="font-semibold mb-1">部門：{mockSOP.department}</p>
            <p>說明文字：{mockSOP.description}</p>
            <p>擁有者：{mockSOP.owner}</p>
          </div>
        </div>

        {/* Steps區 */}
        <div className="flex-1 overflow-auto">
          <div className="flex items-center gap-12">
            {mockSOP.steps.map((step) => (
              <div
                key={step.id}
                className="min-w-[120px] h-[80px] bg-gray-200 rounded flex items-center justify-center font-semibold"
              >
                {step.label}
              </div>
            ))}
          </div>
          {/* 畫線連接可用 SVG 或外部 lib */}
        </div>
      </div>

      {/* 底部按鈕列 */}
      <div className="flex justify-center gap-6 mt-8 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
        >
          回上一頁
        </button>
        <button
          onClick={handleCollect}
          disabled={collected}
          className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {collected ? '已收藏' : '收藏'}
        </button>
      </div>

      <Footer />
    </>
  );
}