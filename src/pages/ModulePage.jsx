import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import ReactFlow, { Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import StepNodeView from "../components/StepNodeView";
import dagre from "dagre";
import { useAuth } from "../hooks/useAuth";

/* ---------- layout helper ---------- */
const NODE_W = 240;
const NODE_H = 80;

function layout(nodes, edges, dir = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: dir, nodesep: 120, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return {
    nodes: nodes.map(n => {
      const p = g.node(n.id);
      return {
        ...n,
        position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 },
      };
    }),
    edges,
  };
}

/* ---------- React component ---------- */
export default function ModulePage() {
  const { id } = useParams(); // SOP_ID
  const nav = useNavigate();
  const [sop, setSop] = useState(null);
  const [collected, setCollected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        console.log("收到的 id：", id);
        const res = await fetch(`/api/sops/${id}/flowchart`);
        if (!res.ok) throw new Error("fetch fail");
        const { data } = await res.json();
        console.log("收到的 data：", data);
        setSop({ raw: data });
      } catch (err) {
        console.error("[ModulePage] 取得 SOP 失敗:", err);
      }
    })();
  }, [id]);

  const rfData = useMemo(() => {
    if (!sop) return { nodes: [], edges: [] };

    const steps = (sop.raw.nodes || []).map(n => ({
      id: n.Module_ID,
      type: "stepView",
      data: {
        title: n.Title,
        brief: n.Title.length > 26 ? n.Title.slice(0, 23) + "…" : n.Title,
        details: n.Details,
        person: n.staff_in_charge,
        docs: n.docs || [],
        type: n.type,
      },
      position: { x: 0, y: 0 },
      draggable: false,
    }));

    const edges = (sop.raw.edges || []).map(e => ({
      id: `${e.from_module}-${e.to_module}`,
      source: e.from_module,
      target: e.to_module,
      type: "step",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#475569",
      },
    }));

    return layout(steps, edges);
  }, [sop]);

  const handleCollect = async () => {
    if (!user?.id) {
      alert("請先登入才能收藏 SOP");
      return;
    }
  
    const payload = {
      SOP_ID: id,
      Personal_ID: user.id,
    };
  
    console.log("📦 傳給後端的收藏參數：", payload);
  
    try {
      const res = await fetch("/api/sops/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      const result = await res.json();
      if (res.ok) {
        setCollected(true);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("❌ 收藏失敗:", err);
      alert("收藏失敗，請稍後再試。");
    }
  };
  
  


  const nodeTypes = useMemo(() => ({ stepView: StepNodeView }), []);

  if (!sop) {
    return (
      <>
        <NavBar />
        <div className="text-center py-20 text-gray-500">載入資料中，請稍候…</div>
        <Footer />
      </>
    );
  }

  const info = sop.raw;
  const formatDate = dt =>
    dt
      ? new Date(dt).toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "（無資料）";

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{info.SOP_Name}</h1>
      </header>
      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-60 border rounded shadow-sm bg-white p-4 text-sm whitespace-pre-wrap">
            <p><strong>部門：</strong>{info.Team_Name}</p>
            <p className="mt-1"><strong>位置：</strong>{info.Location ?? "（無資料）"}</p>
            <p className="mt-1"><strong>簡介：</strong>{info.SOP_Content ?? "（無資料）"}</p>
            <p className="mt-1"><strong>最後編輯時間：</strong>{formatDate(info.Create_Time)}</p>
            <p className="mt-1"><strong>SOP 瀏覽次數：</strong>{info.views ?? "（無資料）"}</p>
          </aside>
          <section className="flex-1 h-[650px] border rounded shadow overflow-auto bg-[#f9fafb]">
            <ReactFlow
              nodes={rfData.nodes}
              edges={rfData.edges}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ type: "step" }}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Controls position="bottom-left" />
            </ReactFlow>
          </section>
        </div>
        <div className="flex justify-center gap-6 mt-12 mb-20">
          <button onClick={() => nav(-1)} className="border px-6 py-2 rounded text-sm hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> 回上一頁
          </button>
          <button
            onClick={handleCollect}
            disabled={collected}
            className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {collected ? "已收藏" : "收藏"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
