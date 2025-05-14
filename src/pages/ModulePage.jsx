import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

import ReactFlow, {
  Controls,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import StepNodeView from '../components/StepNodeView';

// 將後端 edges 轉換為 React Flow edges 格式
const toRfEdges = (edges) => edges.map(e => ({
  id: `${e.from}-${e.to}`,
  source: e.from.toString(),
  target: e.to.toString(),
  type: 'straight',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#475569',
  },
}));

export default function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sop, setSop] = useState(null);
  const [collected, setCollected] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/sops/${id}/flowchart`);
        if (!res.ok) throw new Error('fetch fail');
        const { data } = await res.json();

        setSop({
          title: data.SOP_Name,
          department: data.Team_Name,
          description: data.SOP_Content,
          steps: (data.nodes || []).map(n => ({
            id: n.Module_ID,
            title: n.Title,
            brief: n.Details ?? n.Title,
            details: n.Details,
            person: n.staff_in_charge,
            docs: n.docs ?? [],
          })),
          edges: (data.edges || []).map(e => ({
            from: e.from_module,
            to: e.to_module,
          })),
        });
      } catch (err) {
        console.error('[ModulePage] 取得 SOP 失敗:', err);
      }
    })();
  }, [id]);

  const nodeTypes = useMemo(() => ({ stepView: StepNodeView }), []);

  const rfData = useMemo(() => {
    if (!sop) return { nodes: [], edges: [] };

    const baseX = 600;
    const baseY = 80;
    const gapY = 220;

    const nodes = sop.steps.map((s, idx) => ({
      id: s.id.toString(),
      type: 'stepView',
      position: { x: baseX, y: baseY + idx * gapY },
      data: {
        ...s,
        isFirst: idx === 0,
        isLast: idx === sop.steps.length - 1,
      },
      draggable: false,
    }));

    return {
      nodes,
      edges: toRfEdges(sop.edges),
    };
  }, [sop]);

  if (!sop) {
    return (
      <>
        <NavBar />
        <div className="text-center py-20 text-gray-500">載入資料中，請稍候…</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{sop.title}</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="min-w-[260px] border rounded shadow-sm bg-white p-4 text-sm">
            <p className="font-semibold mb-1">部門：{sop.department}</p>
            <p className="whitespace-pre-line">簡介：{sop.description || '—'}</p>
          </aside>

          <section className="flex-1 h-[650px] border rounded shadow overflow-auto bg-[#f9fafb]">
            <ReactFlow
              nodes={rfData.nodes}
              edges={rfData.edges}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Controls position="bottom-left" />
            </ReactFlow>
          </section>
        </div>

        <div className="flex justify-center gap-6 mt-12 mb-20">
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

      <Footer />
    </>
  );
}