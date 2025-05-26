import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import ReactFlow, { MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import StepNodeView from "../components/StepNodeView";
import dagre from "dagre";
import { useAuth } from "../hooks/useAuth";

const NODE_W = 240;
const NODE_H = 80;

function layout(nodes, edges, dir = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: dir, nodesep: 120, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  let maxY = 0;
  const laidNodes = nodes.map((n) => {
    const p = g.node(n.id);
    maxY = Math.max(maxY, p.y);
    return {
      ...n,
      position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 },
    };
  });

  return {
    nodes: laidNodes,
    edges,
    height: maxY + NODE_H + 120, 
  };
}

export default function ModulePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [sop, setSop] = useState(null);
  const [collected, setCollected] = useState(false);
  const [view, setview] = useState(null);

  /* 取得 SOP 與流程圖 */
  useEffect(() => {
    (async () => {
      try {
        const queryParams = user?.id
          ? `?Personal_ID=${encodeURIComponent(user.id)}`
          : '';
        const res = await fetch(`/api/sops/${id}/flowchart${queryParams}`);
        if (!res.ok) throw new Error("fetch fail");
        const { views, data } = await res.json();
        setSop({ raw: data });
        setview({ raw: views });

      } catch (err) {
        console.error("[ModulePage] 取得 SOP 失敗:", err);
      }
    })();
  }, [id]);

  /* 檢查是否已收藏 */
  useEffect(() => {
    if (!user || !id) return;
  
    (async () => {
      try {
        const res = await fetch(`/api/sops/search?page=save&personal_id=${user.id}`);
        if (!res.ok) throw new Error("check collection failed");
  
        const result = await res.json();
        const collectedIds = result.map((s) => s.id ?? s.SOP_ID); // ⛑ 保險：兼容不同欄位命名
        setCollected(collectedIds.includes(id));
      } catch (err) {
        console.error("檢查收藏狀態失敗:", err);
        setCollected(false);
      }
    })();
  }, [user, id]);
  

  /* 收藏 / 取消收藏 
  const toggleCollect = async () => {
    if (!user) return alert("請先登入");
    const endpoint = collected ? "unsave" : "save";
    try {
      await fetch(`/api/sops/${endpoint}?SOP_ID=${id}&Personal_ID=${user.id}`, {
        method: "POST",
      });
      setCollected(!collected);
    } catch (err) {
      console.error("收藏操作失敗:", err);
    }
  };*/

  /* 產生 ReactFlow nodes / edges */
  const rfData = useMemo(() => {
    if (!sop) return { nodes: [], edges: [], height: 600 };

    const steps = (sop.raw.nodes || []).map((n) => ({
      id: n.Module_ID,
      type: "stepView",
      data: {
        id: n.Module_ID,
        title: n.Title,
        brief: n.Title.length > 26 ? n.Title.slice(0, 23) + "…" : n.Title,
        details: n.Details,
        person: n.staff_in_charge,
        person_name: n.User_Name,
        email: n.Email,
        ex_number: n.Ex_number,
        departmentname: n.Department_Name,
        team_name: n.Team_Name,
        type: n.type,
        formLinks: Array.isArray(n.form_links)   // ✅ 修改 key 名
        ? n.form_links
        : [],
      },
      position: { x: 0, y: 0 },
      style: { width: NODE_W, height: NODE_H },
      draggable: false,
    }));

    const edges = (sop.raw.edges || []).map((e) => ({
      id: `${e.from_module}-${e.to_module}`,
      source: e.from_module,
      target: e.to_module,
      type: "straight",
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#475569" },
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
    <div className="min-h-screen flex flex-col">
      {/* 頁首 */}
      <NavBar />

      {/* 置中顯示載入文字，並撐開空間 */}
      <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
        載入資料中，請稍候…
      </div>

      {/* 頁尾永遠貼底 */}
      <Footer />
    </div>
  );
}

  const info = sop.raw;
  const formatDate = (dt) =>
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
      <header className="bg-secondary py-6 text-center">
        <h1 className="text-3xl font-bold text-primary">{info.SOP_Name}</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* 側邊資訊卡 */}
          <aside className="w-full lg:w-64 border rounded shadow-sm bg-white p-4 text-sm whitespace-pre-wrap">
            <p>
              <strong>部門：</strong>
              {info.Team_Name}
            </p>
            <p className="mt-1">
              <strong>位置：</strong>
              {info.Location ?? "（無資料）"}
            </p>
            <p className="mt-1">
              <strong>簡介：</strong>
              {info.SOP_Content ?? "（無資料）"}
            </p>
            <p className="mt-1">
              <strong>創建時間：</strong>
              {formatDate(info.Create_Time)}
            </p>
            <p className="mt-1">
              <strong>SOP 瀏覽次數：</strong>
              {typeof view?.raw === 'number' ? view.raw : 0}
            </p>
          </aside>

          {/* Flow 區域 */}
          <section className="flex-1 bg-white">
            {rfData.nodes.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                此 SOP 尚未建立任何流程節點
              </div>
            ) : (
              <div
                className="
                  relative w-full
                  border border-gray-300
                  shadow-sm
                  rounded-lg
                  bg-gray-50        /* 淡灰底 */
                "
                style={{ height: rfData.height }}
              >
                <ReactFlow
                  nodes={rfData.nodes}
                  edges={rfData.edges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  panOnScroll
                  proOptions={{ hideAttribution: true }}
                />
              </div>
            )}
          </section>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-center gap-6 mt-12 mb-20">
          <button
            onClick={() => nav(-1)}
            className="border px-6 py-2 rounded text-sm hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" /> 回上一頁
          </button>

          <button
            onClick={async () => {
              if (!user?.id) return alert("請先登入才能收藏 SOP");
              try {
                const response = await fetch(`/api/sops/${collected ? 'unsave' : 'save'}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ SOP_ID: id, Personal_ID: user.id }),
                });
                if (!response.ok) throw new Error('操作失敗');
                const result = await response.json();
                alert(result.message);
                setCollected(!collected);
              } catch (err) {
                console.error('❌ 收藏操作失敗:', err);
                alert('操作失敗，請稍後再試');
              }
            }}
            className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90"
          >
            {collected ? "取消收藏" : "收藏"}
          </button>
        </div>
      </main>
      <Footer />

    </>
  );
}
