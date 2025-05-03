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
  );
}