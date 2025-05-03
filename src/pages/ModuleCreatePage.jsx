import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function ModuleCreatePage() {
  const { id } = useParams(); // 取得 SOP ID
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const handleAddNode = () => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      data: { label: `節點 ${nodes.length + 1}` },
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      type: 'default',
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = () => {
    const saveData = {
      nodes,
      edges,
    };
    console.log('要送出的流程資料：', saveData);
    // 這裡可以串後端 API 儲存
    alert('流程儲存成功！（目前只console.log）');
  };

  return (
    <>
      <NavBar />

      <header className="bg-secondary py-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">建立 SOP 流程（ID: {id}）</h1>
      </header>

      <main className="px-6 py-10 max-w-7xl mx-auto">
        <div className="h-[500px] border rounded shadow relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleAddNode}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            新增節點
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            儲存流程
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}