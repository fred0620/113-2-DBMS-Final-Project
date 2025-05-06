import { useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as Dialog from '@radix-ui/react-dialog';

/* ----------  選單節點 (可點擊開 Modal)  ---------- */
function StepNode({ data, isFirst, isLast }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 連接點 — 上方 (第一節點不顯示) */}
      {!isFirst && (
        <Handle type="target" position={Position.Top} id="t" />
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer px-8 py-6 min-w-[220px] text-center text-sm shadow-md border border-gray-300">
            {data.brief || data.title}
          </div>
        </Dialog.Trigger>

        {/* ----------  Modal ---------- */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] bg-white rounded-lg shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-lg font-bold mb-2">
              {data.title}
            </Dialog.Title>

            {/* (1) Module name 由上方 Title 顯示，此處略  */}
            {/* (2) Detail */}
            {data.details && (
              <section>
                <h3 className="font-semibold mb-1">Detail</h3>
                <p className="text-sm whitespace-pre-line">
                  {data.details}
                </p>
              </section>
            )}

            {/* (3) Person in charge */}
            {data.person && (
              <section>
                <h3 className="font-semibold mb-1">Person in charge</h3>
                <p className="text-sm whitespace-pre-line">
                  {data.person}
                </p>
              </section>
            )}

            {/* (4) Documents */}
            {data.docs?.length > 0 && (
              <section>
                <h3 className="font-semibold mb-1">Documents</h3>
                <div className="flex gap-3 flex-wrap">
                  {data.docs.map((d) => (
                    <a
                      key={d.url}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-14 bg-gray-100 hover:bg-gray-200 border rounded flex items-center justify-center text-xs font-semibold"
                    >
                      {d.type.toUpperCase()}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <Dialog.Close className="mt-6 inline-block px-4 py-2 bg-primary text-white rounded text-sm">
              Close
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 連接點 — 下方 (最後節點不顯示) */}
      {!isLast && (
        <Handle type="source" position={Position.Bottom} id="s" />
      )}
    </>
  );
}

/* ----------  主元件  ---------- */
export default function ModuleFlowHorizontalWithModal({ sop }) {
  const nodeTypes = useMemo(() => ({ step: StepNode }), []);
  const flowRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  /* === 將節點資料轉成 React‑Flow 需要的結構 === */
  const baseX = 350;   // ★ 調整水平置中位置
  const baseY = 80;
  const gapY  = 220;

  const nodes = sop.steps.map((step, idx) => ({
    id: step.id.toString(),
    type: 'step',
    position: { x: baseX, y: baseY + idx * gapY },
    data: step,
    draggable: false,
  }));

  /* === 直線 Edge === */
  const edges = sop.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from.toString(),
    target: e.to.toString(),
    type: 'straight',            // 直線
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#475569',
    },
    style: { stroke: '#475569', strokeWidth: 1.5 },
  }));

  /* === 自動 fitView 一次 === */
  useEffect(() => {
    if (rfInstance) {
      setTimeout(() => {
        rfInstance.fitView({ padding: 0.15 });
      }, 300);
    }
  }, [rfInstance]);

  return (
    <div
      ref={flowRef}
      style={{
        width: '100%',
        height: '700px',
        background: '#f9fafb',
        border: '1px solid #d9d9d9',
        overflow: 'auto',
      }}
    >
      <ReactFlow
        nodes={nodes.map((n, i) => ({
          ...n,
          data: { ...n.data, isFirst: i === 0, isLast: i === nodes.length - 1 },
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
      </ReactFlow>
    </div>
  );
}