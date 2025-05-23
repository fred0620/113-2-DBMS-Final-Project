import { useMemo, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Controls,
  MarkerType,
  Position,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import * as Dialog from "@radix-ui/react-dialog";

function StepNode({ data, isFirst, isLast }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!isFirst && <Handle type="target" position={Position.Top} id="t" />}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer px-8 py-6 min-w-[220px] text-center text-sm shadow-md border border-gray-300">
            {data.brief || data.title}
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-lg shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-lg font-bold mb-2">{data.title}</Dialog.Title>

            {data.details && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">詳細內容：</h3>
                  <p className="text-sm whitespace-pre-line">{data.details}</p>
                </section>
              </>
            )}

            {data.person && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">負責人員：</h3>
                  <p className="text-sm whitespace-pre-line">{data.personName || data.person || '（無資料）'}</p>
                </section>
              </>
            )}

            {data.docs?.length > 0 && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">相關文件/連結：</h3>
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
              </>
            )}

            <Dialog.Close className="mt-6 inline-block px-4 py-2 bg-primary text-white rounded text-sm">
              關閉
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {!isLast && <Handle type="source" position={Position.Bottom} id="s" />}
    </>
  );
}

export default function ModuleFlowHorizontalWithModal({ sop }) {
  const nodeTypes = useMemo(() => ({ step: StepNode }), []);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const baseX = 600;
  const baseY = 80;
  const gapY = 220;

  const nodes = sop.steps.map((s, idx) => ({
    id: s.id.toString(),
    type: "step",
    position: { x: baseX, y: baseY + idx * gapY },
    data: s,
    draggable: false,
  }));

  const edges = sop.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from.toString(),
    target: e.to.toString(),
    type: "straight",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#475569",
    },
  }));

  useEffect(() => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 300);
    }
  }, [reactFlowInstance]);

  return (
    <div
      ref={reactFlowWrapper}
      className="module-flow-wrapper"
      style={{
        width: "100%",
        height: "700px",
        background: "#f9fafb",
        border: "1px solid #d9d9d9",
        overflow: "auto",
      }}
    >
      <ReactFlow
        nodes={nodes.map((n, i) => ({
          ...n,
          type: "step",
          data: {
            ...n.data,
            isFirst: i === 0,
            isLast: i === nodes.length - 1,
          },
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
      </ReactFlow>
    </div>
  );
}