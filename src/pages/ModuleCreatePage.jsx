// ✅ ModuleCreatePage.jsx（加入 SOP Info）
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Position,
} from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { nanoid } from 'nanoid';
import 'reactflow/dist/style.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PRIMARY = '#0f307a';

function StepNode({ data, selected }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: data.title || '',
    detail: data.detail || '',
    person: data.person || '',
    docs: data.docs || '',
  });

  const inputCls = 'w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary';

  const handleSave = () => {
    if (!form.title.trim()) return alert('Module Name 為必填！');
    data.onSave(form);
    setOpen(false);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Bottom} id="s" />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className={`rounded-xl border-2 px-8 py-4 min-w-[220px] text-center bg-white cursor-pointer ${selected ? 'border-primary' : 'border-slate-400'}`}>
            {form.title || '(未命名 Module)'}
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] bg-white rounded-lg shadow-lg p-6 space-y-5 z-50">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Module Name<span className="text-red-600">*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Detail</label>
                <textarea rows={3} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Person in charge</label>
                <input value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Documents (URL)</label>
                <input value={form.docs} onChange={(e) => setForm({ ...form, docs: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <AlertDialog.Root>
                <AlertDialog.Trigger asChild>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">刪除</button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                  <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-white rounded-lg shadow-lg p-6 space-y-5 z-50">
                    <AlertDialog.Title className="text-lg font-bold">確認刪除此 Module？</AlertDialog.Title>
                    <AlertDialog.Description className="text-sm">這個動作無法復原。</AlertDialog.Description>
                    <div className="flex justify-end gap-3 pt-4">
                      <AlertDialog.Cancel asChild>
                        <button className="border px-4 py-1.5 rounded text-sm">取消</button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <button onClick={data.onDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm">確認刪除</button>
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
              <Dialog.Close asChild>
                <button className="border px-4 py-2 rounded text-sm">取消</button>
              </Dialog.Close>
              <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90">儲存</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default function ModuleCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sopInfo, setSopInfo] = useState({ SOP_Name: '', SOP_Content: '' });

  useEffect(() => {
    const fetchSOPInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sops/${id}/info`);
        const data = await res.json();
        setSopInfo({ SOP_Name: data.SOP_Name, SOP_Content: data.SOP_Content });
      } catch (err) {
        console.error('載入 SOP 資訊失敗', err);
      }
    };
    fetchSOPInfo();
  }, [id]);

  const handleAddNode = () => {
    const newId = nanoid(6);
    const yMax = nodes.length ? Math.max(...nodes.map((n) => n.position.y)) : 0;
    setNodes((nds) =>
      nds.concat({
        id: newId,
        position: { x: 400, y: yMax + 160 },
        type: 'step',
        data: {
          title: '', detail: '', person: '', docs: '',
          onSave: (updated) => setNodes((prev) => prev.map((n) => n.id === newId ? { ...n, data: { ...n.data, ...updated } } : n)),
          onDelete: () => handleDeleteNode(newId),
        },
      })
    );
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  };

  const onConnect = useCallback((params) => setEdges((eds) =>
    addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed, color: PRIMARY }, style: { stroke: PRIMARY, strokeWidth: 1.5 } }, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    try {
      const modules = nodes.map((node) => ({
        action: 'create',
        Module_ID: node.id,
        Type: 'process',
        Title: node.data.title,
        Details: node.data.detail,
        staff_in_charge: node.data.person,
        form_links: node.data.docs ? [{ Link: node.data.docs }] : [],
      }));

      const edgesData = edges.map((e) => ({
        from_module: e.source,
        to_module: e.target,
      }));

      const res = await fetch(`${API_BASE}/api/sops/${id}/modules-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules,
          edges: edgesData,
          Updated_by: '302912', // 改為模擬使用者 ID
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      alert('儲存成功！');
    } catch (err) {
      console.error('[ModuleCreatePage] 儲存錯誤：', err);
      alert('儲存失敗，請稍後再試');
    }
  };

  const nodeTypes = useMemo(() => ({ step: StepNode }), []);
//要改
  return (
    <>
      <NavBar />
      <div className="bg-primary text-white px-6 py-2 text-sm">
        {sopInfo.SOP_Name || '未命名 SOP'}（編輯中） – ID: {id}
      </div>
      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="h-[600px] border rounded shadow-sm">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} size={1.5} />
            <MiniMap />
            <Controls position="bottom-left" />
          </ReactFlow>
        </div>
        <div className="relative z-[50] flex justify-center gap-4 mt-6">
          <button onClick={() => navigate(-1)} className="border px-6 py-2 rounded hover:bg-gray-100">← 回上一頁</button>
          <button onClick={handleAddNode} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90">新增 Module</button>
          <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90">儲存流程</button>
        </div>
      </main>
      <Footer />
    </>
  );
}
