import { useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as Dialog from '@radix-ui/react-dialog';

function StepNode({ data }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Handle type="target" position={Position.Left} id="t" />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer px-5 py-3 min-w-[110px] text-center text-sm shadow">
            {data.brief || data.title}
          </div>
        </Dialog.Trigger>

        {/* === 彈窗 === */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-lg shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-lg font-bold mb-2">{data.title}</Dialog.Title>

            {data.details && (
              <section>
                <h3 className="font-semibold mb-1">Details</h3>
                <p className="text-sm whitespace-pre-line">{data.details}</p>
              </section>
            )}

            {data.person && (
              <section>
                <h3 className="font-semibold mb-1">Person in charge</h3>
                <p className="text-sm whitespace-pre-line">{data.person}</p>
              </section>
            )}

            {data.docs?.length > 0 && (
              <section>
                <h3 className="font-semibold mb-1">Document</h3>
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

            <Dialog.Close className="mt-4 inline-block px-4 py-1 bg-primary text-white rounded text-sm">
              Close
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Handle type="source" position={Position.Right} id="s" />
    </>
  );
}

export default function ModuleFlowHorizontalWithModal({ sop }) {
  const nodeTypes = useMemo(() => ({ step: StepNode }), []);

  const childrenMap = {};
  sop.edges.forEach(({ from, to }) => {
    if (!childrenMap[from]) childrenMap[from] = [];
    childrenMap[from].push(to);
  });

  const baseX = 240;
  const baseY = 160;
  const gapX  = 260;
  const branchGap = 120;

  const nodes = sop.steps.map((s, idx) => {
    let y = baseY;
    const x = baseX + idx * gapX;

    Object.entries(childrenMap).forEach(([pid, arr]) => {
      if (arr.length > 1) {
        const pos = arr.indexOf(s.id);
        if (pos >= 0) {
          const offset = branchGap * (Math.floor(pos / 2) + 1);
          y = pos % 2 === 0 ? baseY - offset : baseY + offset;
        }
      }
    });

    return {
      id: s.id.toString(),
      type: 'step',
      position: { x, y },
      data: s
    };
  });

  /* 產生 edges (箭頭) */
  const edges = sop.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from.toString(),
    target: e.to.toString(),
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#475569'
    }
  }));

  return (
    <div className="module-flow-wrapper" style={{ width: '100%', height: 420 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
      </ReactFlow>
    </div>
  );
}