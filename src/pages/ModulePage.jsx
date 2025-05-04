import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import ModuleFlowHorizontalWithModal from '../components/ModuleFlowHorizontalWithModal';

export default function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sop, setSop] = useState(null);
  const [collected, setCollected] = useState(false);

  /* ───────── mock SOP  ───────── */
  useEffect(() => {
    async function fetchSOP() {
      try {
          /*連後端 */
        const res = await fetch(`/api/sop/${id}.json`);
        if (!res.ok) throw new Error('fetch fail');
        const data = await res.json();
        setSop(data);
      } catch {
        /* mock */
        setSop({
          title: '大學生退學SOP',
          department: '學務處',
          description: '詳細說明文字',
          owner: '王小明',
          steps: [
            { id: '1', title: 'STEP1', brief: 'Step 1 簡述' },
            { id: '2', title: 'STEP2', brief: 'Step 2 簡述' },
            { id: '3-1', title: 'STEP3.1', brief: '分支 3-1' },
            { id: '3-2', title: 'STEP3.2', brief: '分支 3-2' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3-1' },
            { from: '2', to: '3-2' }
          ]
        });
      }
    }
    fetchSOP();
  }, [id]);

  if (!sop) return <p className="text-center py-20">載入資料中…</p>;

  return (
    <>
      <NavBar />

      {/* 頂部標題 */}
      <header className="bg-secondary py-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">{sop.title}</h1>
      </header>

      {/* 主內容 */}
      <div className="max-w-7xl mx-auto px-6 mt-10 flex gap-8">
        {/* 說明卡片 */}
        <div className="min-w-[260px] border rounded shadow-sm bg-white p-4 text-sm self-start">
          <p className="font-semibold mb-1">部門：{sop.department}</p>
          <p className="mb-1 whitespace-pre-line">說明文字：{sop.description}</p>
          <p>擁有者：{sop.owner}</p>
        </div>

        {/* Flowchart */}
        <div className="module-flow-wrapper flex-1 h-[500px]">
          <ModuleFlowHorizontalWithModal sop={sop} />
        </div>
      </div>

      {/* 底部按鈕列 */}
      <div className="flex justify-center gap-6 mt-12 mb-16">
        <button
          onClick={() => navigate(-1)}
          className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" /> 回上一頁
        </button>
        <button
        /*連後端 */
          onClick={() => setCollected(true)}
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