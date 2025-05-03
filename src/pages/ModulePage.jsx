import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

import ReactFlow, {
  Controls, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import StepNodeView from '../components/StepNodeView';   // ← 已能開 Modal 的 Node

/* 小工具：後端 edges → React‑Flow */
const toRfEdges = (edges)=>edges.map(e=>({
  id   : `${e.from}-${e.to}`,
  source: e.from.toString(),
  target: e.to.toString(),
  type : 'straight',
  markerEnd:{
    type:MarkerType.ArrowClosed,width:20,height:20,color:'#475569',
  },
}));

export default function ModulePage(){
  /* ---------------- React hooks ---------------- */
  const { id }   = useParams();
  const navigate = useNavigate();

  const [sop, setSop]           = useState(null);
  const [collected,setCollected]= useState(false);

  useEffect(() => {
    async function fetchSOP() {
      try {
        const res = await fetch(`/api/sops/${id}/flowchart`);
        if (!res.ok) throw new Error('fetch fail');
        const { data } = await res.json();

        const mapped = {
          title: data.SOP_Name,
          department: data.Team_Name,
          description: data.SOP_Content,
          steps: data.nodes.map(node => ({
            id: node.Module_ID,
            title: node.Title,
            brief: node.Details ?? node.Title,
            details: node.Details,
            person: node.staff_in_charge,
            docs: node.docs ?? [],
          })),
          edges: data.edges.map(edge => ({
            from: edge.from_module,
            to: edge.to_module,
          })),
        };

        setSop(mapped);
      } catch (err) {
        console.error('[ModulePage] 取得 SOP 失敗：', err);
      }
    }
    fetchSOP();
  }, [id]);

  if (!sop) return (
    <>
      <NavBar />
      <div className="text-center py-20 text-gray-500">載入資料中...</div>
      <Footer />
    </>
  );

  return (
    <>
      <NavBar/>

      <header className="bg-secondary py-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{sop.title}</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左側：基本資訊 */}
          <div className="min-w-[260px] border rounded shadow-sm bg-white p-4 text-sm">
            <p className="font-semibold mb-1">部門：{sop.department}</p>
            <p className="whitespace-pre-line">說明文字：{sop.description}</p>
          </div>

          {/* 右側：流程圖 */}
          <div className="flex-1">
            <ModuleFlowHorizontalWithModal sop={sop} />
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-center gap-6 mt-12">
          <button
            onClick={() => navigate(-1)}
            className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" /> 回上一頁
          </button>
          <button
            onClick={() => setCollected(true)}
            disabled={collected}
            className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {collected ? '已收藏' : '收藏'}
          </button>
        </div>
      </main>

      <Footer/>
    </>
  );
}