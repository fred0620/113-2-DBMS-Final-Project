import { useEffect, useState, useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export default function ModuleFlowView({ sopId }) {
  const [sop, setSop] = useState(null);

  useEffect(() => {
    async function fetchSOP() {
  /* 連後端 */
      const res = await fetch(`/api/sop/${sopId}.json`);
      const data = await res.json();
      setSop(data);
    }
    fetchSOP();
  }, [sopId]);

  const { nodes, edges } = useMemo(() => {
    if (!sop) return { nodes: [], edges: [] };

    const nodes = sop.steps.map((step, idx) => ({
      id: step.id,
      data: { label: step.title },
      position: { x: idx * 250, y: 0 },
      style: { width: 120, height: 80 }
    }));

    const edges = sop.edges.map((e) => ({
      id: e.from + '-' + e.to,
      source: e.from,
      target: e.to,
      animated: false,
      type: 'smoothstep'
    }));

    return { nodes, edges };
  }, [sop]);

  if (!sop) return <p className="text-center py-20">載入模組...</p>;

  return (
    <div style={{ width: '100%', height: '400px' }} className="my-8">
      <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.5}>
        <Background variant="dots" gap={16} size={1} />
        <Controls position="bottom-left" />
      </ReactFlow>
    </div>
  );
}