import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import ReactFlow, { MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import StepNodeView from "../components/StepNodeView";
import dagre from "dagre";

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

// ✅ 顯示台灣時間（加 8 小時，無秒數）
function formatTaiwanTime(utcString) {
  if (!utcString) return "（無時間資料）";
  try {
    const date = new Date(utcString);
    const taiwanTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return `${taiwanTime.getFullYear()}/${String(taiwanTime.getMonth() + 1).padStart(2, "0")}/${String(taiwanTime.getDate()).padStart(2, "0")} ${
      taiwanTime.getHours() >= 12 ? "下午" : "上午"
    } ${String(taiwanTime.getHours() % 12 || 12).padStart(2, "0")}:${String(taiwanTime.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "（時間格式錯誤）";
  }
}

export default function RecoverPage() {
  const { id, version } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [sop, setSop] = useState(null);
  const [recovering, setRecovering] = useState(false);
  const [view, setview] = useState(null);
  const [updateTime, setUpdateTime] = useState(null); // ✅ 加入 Update_Time 狀態

  // 主版本資料
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/sops/${id}/history/${version}`);
        const { views, data } = await res.json();
        console.log("📦 歷史版本資料：", data);
        setSop({ raw: data });
        setview({ raw: views });
      } catch (err) {
        console.error("[RecoverPage] 取得歷史版本失敗:", err);
      }
    })();
  }, [id, version]);

  // 額外查詢所有版本的 Update_Time
  useEffect(() => {
    if (!id || !version) return;
    (async () => {
      try {
        const res = await fetch(`/api/sops/${id}/history`);
        const data = await res.json();
        const found = data.history?.find((h) => String(h.version) === String(version));
        setUpdateTime(found?.Update_Time || null);
      } catch (err) {
        console.error("❌ 取得版本時間失敗:", err);
      }
    })();
  }, [id, version]);

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
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#475569",
      },
    }));

    return layout(steps, edges);
  }, [sop]);

  const nodeTypes = useMemo(() => ({ stepView: StepNodeView }), []);

  if (!sop) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
          載入資料中，請稍候…
        </div>
        <Footer />
      </div>
    );
  }

  const info = sop.raw;

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-6 text-center">
        <h1 className="text-3xl font-bold text-primary">{info.SOP_Name}</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* 側邊欄資訊卡 */}
          <aside className="w-full lg:w-64 border rounded shadow-sm bg-white p-4 text-sm whitespace-pre-wrap">
            <p><strong>部門：</strong>{info.Team_Name}</p>
            <p className="mt-1"><strong>位置：</strong>{info.Location ?? "（無資料）"}</p>
            <p className="mt-1"><strong>簡介：</strong>{info.SOP_Content ?? "（無資料）"}</p>
            <p className="mt-1"><strong>最後編輯時間：</strong>{formatTaiwanTime(updateTime || info.Create_Time)}</p>
          </aside>

          {/* Flow 圖表 */}
          <section className="flex-1 bg-white">
            {rfData.nodes.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                此 SOP 尚未建立任何流程節點
              </div>
            ) : (
              <div
                className="relative w-full border border-gray-300 shadow-sm rounded-lg bg-gray-50"
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
            disabled={recovering}
            onClick={async () => {
              try {
                setRecovering(true);
                const res = await fetch(`/api/sops/${id}/recover/${version}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    Updated_by: user?.adminId || "Unknown",
                  }),
                });
                const data = await res.json();
                alert("✅ 已成功恢復為此版本！");
                nav(`/mypage`);
              } catch (err) {
                console.error("❌ 恢復失敗:", err);
                alert("❌ 恢復失敗");
              } finally {
                setRecovering(false);
              }
            }}
            className="bg-primary text-white px-6 py-2 rounded text-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {recovering ? "恢復中..." : "恢復為此版本"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
