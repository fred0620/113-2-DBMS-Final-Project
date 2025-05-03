<<<<<<< ours
import { useCallback, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar   from '../components/NavBar';
import Footer   from '../components/Footer';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft } from 'lucide-react';
import 'reactflow/dist/style.css';

/* ---------- 節點 UI（可拖曳 / 可開 Modal 編輯） ---------- */
function StepNode({ data }) {
  return (
    <>
      <Handle type="target" position={Position.Top}    id="t" />
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-6 py-4 min-w-[200px] max-w-[260px] text-center text-sm shadow break-words cursor-pointer">
            {data.title || '未命名 Module'}
          </div>
        </Dialog.Trigger>

        {/* ===== Modal ===== */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] bg-white rounded-xl shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-xl font-bold mb-4">
              編輯 Module – {data.id}
            </Dialog.Title>

            {[
              { key:'title',  label:'Module Name*',      tag:'input',    required:true },
              { key:'details',label:'Detail',            tag:'textarea' },
              { key:'person', label:'Person in charge',  tag:'input'    },
              { key:'docs',   label:'Document(URL)',     tag:'input'    },
            ].map((f)=>(
              <div key={f.key}>
                <label className="block font-semibold mb-1">{f.label}</label>
                {f.tag==='textarea' ? (
                  <textarea
                    rows={3}
                    defaultValue={data[f.key]||''}
                    onChange={(e)=> data[f.key]=e.target.value}
                    className="border rounded w-full px-3 py-1.5 resize-none"
                  />
                ):(
                  <input
                    defaultValue={data[f.key]||''}
                    onChange={(e)=> data[f.key]=e.target.value}
                    className="border rounded w-full px-3 py-1.5"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close className="px-4 py-1.5 border rounded hover:bg-gray-100">
                取消
              </Dialog.Close>
              <Dialog.Close
                className="px-6 py-1.5 bg-primary text-white rounded hover:bg-primary/90"
              >
                儲存
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Handle type="source" position={Position.Bottom} id="s" />
    </>
  );
}

/* ---------- 主要頁面 ---------- */
export default function ModuleEditPage() {
  const { id } = useParams();            /* SOP_ID */
  const navigate = useNavigate();

  /* === 初始空流程 ===   (之後可以改成 fetch 後端流程再 setNodes / setEdges) */
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /* React‑Flow 連線 */
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, markerEnd: { type: MarkerType.ArrowClosed } },
          eds
        )
      ),
    [setEdges]
  );

  /* 新增 Module */
  const handleAddNode = () => {
    const virtualId = `virtual-${Date.now()}`;          // 產生暫時 ID
    const newNode = {
      id: virtualId,
      type: 'step',
      position: { x: Math.random() * 600, y: Math.random() * 400 },
      data: { id: virtualId, title: '' },               // 其它欄位留空
    };
    setNodes((nds) => nds.concat(newNode));
  };

  /* 刪除 Module（選中再刪） */
  const handleDeleteSelected = () => {
    if (nodes.filter((n) => n.selected).length === 0) {
      alert('請先點選要刪除的 Module');
      return;
    }
    if (!window.confirm('確定要刪除選取的 Module？')) return;
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected && nodes.some((n)=>n.id===e.source || n.id===e.target)));
  };

  /* 儲存流程：TODO 串後端 */
  const handleSave = () => {
    const payload = { nodes, edges };
    console.log('🚀 要送出的流程：', payload);
    // TODO: 呼叫 POST /api/sops/:id/flowchart 之類的 API
    alert('已暫存於 console.log\n（等後端 API 完成後改成真正送出）');
  };

  /* ===== React‑Flow 專用設定 ===== */
  const nodeTypes = useMemo(()=>({ step: StepNode }),[]);

  return (
    <>
      <NavBar />

      {/* 頁首：顯示 SOP 名稱 / 回上一頁 */}
      <header className="bg-secondary py-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">
          編輯 SOP 流程（SOP_ID: {id}）
        </h1>
      </header>

      {/* 主要畫布 */}
      <main className="px-6 py-10 max-w-7xl mx-auto">
        <div className="h-[600px] border rounded shadow">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls position="bottom-left" />
          </ReactFlow>
        </div>

        {/* 底部操作列 */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            回上一頁
          </button>

          <button
            onClick={handleAddNode}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            新增 Module
          </button>

          <button
            onClick={handleDeleteSelected}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            刪除選取
          </button>

          <button
            onClick={handleSave}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            儲存流程
          </button>
        </div>
      </main>

      <Footer />
    </>
=======
import { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

export default function ModuleEditPage() {
  const [sopInfo, setSopInfo] = useState({ title: '', brief: '' });

  useEffect(() => {
    const stored = localStorage.getItem('sopInfo');
    if (stored) {
      setSopInfo(JSON.parse(stored));
    }
  }, []);

  const nodes = [
    {
      id: '1',
      type: 'default',
      position: { x: 250, y: 5 },
      data: { label: '第一步驟' },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 250, y: 150 },
      data: { label: '第二步驟' },
    },
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-white p-4">
        <h1>{sopInfo.title || '未命名 SOP'}（編輯中）</h1>
        <p className="text-sm">{sopInfo.brief}</p>
      </header>

      <main className="flex-grow bg-gray-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background gap={16} size={1} />
        </ReactFlow>
      </main>
    </div>
>>>>>>> theirs
  );
}