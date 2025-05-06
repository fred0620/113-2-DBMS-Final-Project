import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';

// ───────── Node 外觀─────────
function EditableNode({ data }) {
  return (
    <>
      {/* 讓本體可接收 dblclick */}
      <div className="pointer-events-auto min-w-[240px] px-6 py-4 bg-white border-2 border-primary/70 rounded-2xl text-center shadow">
        <p className="text-lg font-semibold truncate">
          {data.name || '(未命名 Module)'}
        </p>
      </div>
      <Handle id="t" type="target" position={Position.Top} />
      <Handle id="s" type="source" position={Position.Bottom} />
    </>
  );
}

// ───────── 主頁面─────────
export default function ModuleCreatePage() {
  const { id: sopId } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Modal 控制
  const [editingNode, setEditingNode] = useState(null); // node 物件
  const [form, setForm] = useState({ name: '', detail: '', person: '', doc: '' });

  // 新增 Module
  const addNode = () =>
    setNodes((nds) =>
      nds.concat({
        id: `temp-${nanoid(6)}`,
        position: { x: 120 + nds.length * 40, y: 120 + nds.length * 40 },
        data: { name: '', detail: '', person: '', doc: '' },
        type: 'editable',
        draggable: true,
      })
    );

  // 雙擊節點 → 開 Modal
  const handleDblClick = (_, node) => {
    setEditingNode(node);
    setForm({ ...node.data });
  };

  // 連線
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
          },
          eds
        )
      ),
    [setEdges]
  );

  // 儲存 Modal
  const saveNode = () => {
    if (!form.name.trim()) return alert('Module Name 為必填');
    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingNode.id ? { ...n, data: { ...form } } : n
      )
    );
    setEditingNode(null);
  };

  // 儲存整張流程 (此處只 console)
  const saveFlow = () => {
    console.log('🟦 送往後端資料：', { nodes, edges });
    alert('流程已暫存（請看 console）');
  };

  return (
    <>
      <NavBar />

      <header className="bg-primary py-3 px-6 text-white font-semibold">
        {`未命名 SOP（編輯中） – ID: ${sopId}`}
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="h-[600px] border rounded-md bg-gray-50">
          <ReactFlow
            nodeTypes={{ editable: EditableNode }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={handleDblClick}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>

        {/* 底部按鈕列 */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            ← 回上一頁
          </button>

          <button
            onClick={addNode}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            新增 Module
          </button>

          <button
            onClick={saveFlow}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            儲存流程
          </button>
        </div>
      </main>

      <Footer />

      {/* ───── Modal 編輯 ───── */}
      <Dialog.Root open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          {editingNode && (
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-xl shadow-lg p-6 z-50">
              <Dialog.Title className="text-xl font-bold mb-4">
                編輯 Module
              </Dialog.Title>

              {/* 4 欄位 */}
              <div className="space-y-4">
                {/* Module Name */}
                <div>
                  <label className="font-semibold text-sm mb-1 block">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="border rounded w-full px-3 py-1.5"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                {/* Detail */}
                <div>
                  <label className="font-semibold text-sm mb-1 block">Detail</label>
                  <textarea
                    rows={3}
                    className="border rounded w-full px-3 py-1.5 resize-none"
                    value={form.detail}
                    onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                  />
                </div>

                {/* Person */}
                <div>
                  <label className="font-semibold text-sm mb-1 block">Person in charge</label>
                  <input
                    className="border rounded w-full px-3 py-1.5"
                    value={form.person}
                    onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
                  />
                </div>

                {/* Document */}
                <div>
                  <label className="font-semibold text-sm mb-1 block">Document (URL)</label>
                  <input
                    className="border rounded w-full px-3 py-1.5"
                    value={form.doc}
                    onChange={(e) => setForm((f) => ({ ...f, doc: e.target.value }))}
                  />
                </div>
              </div>

              {/* Modal 按鈕 */}
              <div className="flex justify-end gap-3 mt-6">
                <Dialog.Close className="px-4 py-1.5 border rounded hover:bg-gray-100">
                  取消
                </Dialog.Close>
                <button
                  onClick={saveNode}
                  className="px-6 py-1.5 bg-primary text-white rounded hover:bg-primary/90"
                >
                  儲存
                </button>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}