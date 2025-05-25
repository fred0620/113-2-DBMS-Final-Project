import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import StepNodeEdit from '../components/StepNodeEdit'; // 路徑依實際調整

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
import { useAuth } from '../hooks/useAuth';
import 'reactflow/dist/style.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PRIMARY = '#0f307a';

/* ──────────── StepNode（Modal 與 CreatePage 同版型） ──────────── */
/*
function StepNode({ data, selected }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: data.title || '',
    detail: data.detail || '',
    person: data.person || '',
    docs: data.docs || '',
  });

  const inputCls =
    'w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary';

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
          <div
            className={`rounded-xl border-2 px-8 py-4 min-w-[220px] text-center bg-white cursor-pointer ${
              selected ? 'border-primary' : 'border-slate-400'
            }`}
          >
            {form.title || '(未命名 Module)'}
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] bg-white rounded-lg shadow-lg p-6 space-y-5 z-50">
            <Dialog.Title className="sr-only">編輯 Module</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Module Name<span className="text-red-600">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detail</label>
                <textarea
                  rows={3}
                  value={form.detail}
                  onChange={(e) =>
                    setForm({ ...form, detail: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Person in Charge
                </label>
                <input
                  value={form.person}
                  onChange={(e) =>
                    setForm({ ...form, person: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Documents (URL)
                </label>
                <input
                  value={form.docs}
                  onChange={(e) =>
                    setForm({ ...form, docs: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            
            <div className="flex justify-end gap-3 pt-6">
              <AlertDialog.Root>
                <AlertDialog.Trigger asChild>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                    刪除
                  </button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                  <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-white rounded-lg shadow-lg p-6 space-y-5 z-50">
                    <AlertDialog.Title className="text-lg font-bold">
                      確認刪除此 Module？
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-sm">
                      這個動作無法復原。
                    </AlertDialog.Description>
                    <div className="flex justify-end gap-3 pt-4">
                      <AlertDialog.Cancel asChild>
                        <button className="border px-4 py-1.5 rounded text-sm">
                          取消
                        </button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <button
                          onClick={data.onDelete}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm"
                        >
                          確認刪除
                        </button>
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>

              <Dialog.Close asChild>
                <button className="border px-4 py-2 rounded text-sm">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90"
              >
                儲存
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
*/
/* ──────────── 主頁面 ──────────── */
export default function ModuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 取得登入者（302912/Q03）

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /* 1.  讀取後端 flowchart */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sops/${id}/flowchart`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        const { nodes: backendNodes = [], edges: backendEdges = [] } = data;

        /* nodes 轉換 */
        const rfNodes = backendNodes.map((m, idx) => ({
          id: m.Module_ID,
          position: {
            x: m.x ?? ((idx % 4) * 260 + 80),
            y: m.y ?? (Math.floor(idx / 4) * 140 + 60),
          },
          type: 'step',
          data: {
            title: m.Title,
            details: m.Details,                      // ✅ 修改 key 名
            person: m.staff_in_charge,
            person_team: m.Team_Name,
            person_name: m.User_Name,
            formLinks: Array.isArray(m.form_links)   // ✅ 修改 key 名
              ? m.form_links
              : [],

            onSave: (form) =>
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === m.Module_ID
                    ? { ...n, data: { ...n.data, ...form } }
                    : n
                )
              ),
            onDelete: () => handleDeleteNode(m.Module_ID),
          },
        }));

        /* edges 轉換 */
        const rfEdges = backendEdges.map((e) => ({
          id: `${e.from_module}-${e.to_module}`,
          source: e.from_module,
          target: e.to_module,
          markerEnd: { type: MarkerType.ArrowClosed, color: PRIMARY },
          style: { stroke: PRIMARY, strokeWidth: 1.5 },
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
      } catch (err) {
        console.error('[ModuleEditPage] 載入流程失敗：', err);
      }
    })();
  }, [id]);

  /* 2. 新增 / 刪除 / 連線 */
  const handleAddNode = () => {
    const newId = nanoid(6); // 不以 M 開頭 → 新節點
    const yMax = nodes.length
      ? Math.max(...nodes.map((n) => n.position.y))
      : 0;
    setNodes((nds) =>
      nds.concat({
        id: newId,
        position: { x: 400, y: yMax + 160 },
        type: 'step',
        data: {
          title: '',
          details: '',
          person: '',
          person_name: '',
          person_team: '',
          formLinks: [],
          onSave: (form) =>
            setNodes((prev) =>
              prev.map((n) =>
                n.id === newId ? { ...n, data: { ...n.data, ...form } } : n
              )
            ),
          onDelete: () => handleDeleteNode(newId),
        },
      })
    );
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: PRIMARY },
            style: { stroke: PRIMARY, strokeWidth: 1.5 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({ step: StepNodeEdit }), []);

  /* 3. 儲存至後端 */
  const handleSave = async () => {
    try {
      // modules
      const modules = nodes.map((n) => {
        const isNew = !/^M\d+$/.test(n.id); // M開頭=既有
        return {
          action: isNew ? 'create' : 'update',
          Module_ID: n.id,
          Type: 'process',
          Title: n.data.title,
          Details: n.data.details,
          staff_in_charge: n.data.person,
          form_links: Array.isArray(n.data.formLinks)
          ? n.data.formLinks.filter(l => l.Link?.trim())
          : [],
          x: n.position.x,
          y: n.position.y,
        };
      });

      // edges
      const edgesData = edges.map((e) => ({
        from_module: e.source,
        to_module: e.target,
      }));

      const res = await fetch(
        `${API_BASE}/api/sops/${id}/modules-batch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modules,
            edges: edgesData,
            Updated_by: user?.name || '302912',
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      alert('儲存成功！');
      // navigate(-1); // 成功後若要回上一頁就打開
    } catch (err) {
      console.error('[ModuleEditPage] 儲存錯誤：', err);
      alert('儲存失敗，請稍後再試');
    }
  };

  /* ──────────── Render ──────────── */
  return (
    <>
      <NavBar />
      <header className="bg-secondary py-4 text-center">
        <h1 className="text-2xl font-bold text-primary">
          編輯 SOP 流程 (SOP_ID: {id})
        </h1>
      </header>

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

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="border px-6 py-2 rounded hover:bg-gray-100"
          >
            ← 回上一頁
          </button>
          <button
            onClick={handleAddNode}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            新增 Module
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
  );
}