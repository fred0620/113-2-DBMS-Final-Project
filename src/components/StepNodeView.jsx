import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import * as Dialog from "@radix-ui/react-dialog";

export default function StepNodeView({ data }) {
  const [open, setOpen] = useState(false);
  const [extraInfo, setExtraInfo] = useState({
    title: "",
    details: "",
    userName: "",
    department: "",
    team: "",
    exNumber: "",
    email: "",
    formLinks: [],
  });

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const res = await fetch(`/api/sops/${data.id}/display`);
        if (!res.ok) throw new Error("Fetch failed");
        const result = await res.json();
        setExtraInfo({
          title: result.Title || "",
          details: result.Details || "",
          userName: result.User_Name || "",
          department: result.Department || "",
          team: result.Team || "",
          exNumber: result.Ex_number || "",
          email: result.Email || "",
          formLinks: result.form_links || [],
        });
      } catch (err) {
        console.error("[StepNodeView] 無法取得模組資訊:", err);
      }
    })();
  }, [open, data.id]);

  return (
    <>
      {data.type !== "start" && (
        <Handle
          type="target"
          position={Position.Top}
          id="t"
          style={{ background: "#0f172a" }}
        />
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div
            title={data.title}
            className="bg-gray-100 hover:bg-gray-200 rounded-lg
              px-4 py-2 text-center text-sm w-[240px] h-[80px] flex items-center justify-center
              border border-slate-400 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {data.brief}
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content
            aria-describedby="node-description"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-lg shadow-lg p-6 space-y-4 z-50"
          >
            <Dialog.Title className="text-lg font-bold">
              {extraInfo.title}
            </Dialog.Title>
            <Dialog.Description id="node-description" className="sr-only">
              SOP 模組詳細內容與負責人資訊
            </Dialog.Description>

            {extraInfo.details && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">詳細內容：</h3>
                  <p className="whitespace-pre-line text-sm">
                    {extraInfo.details}
                  </p>
                </section>
              </>
            )}

            {(extraInfo.userName || extraInfo.department || extraInfo.team || extraInfo.exNumber || extraInfo.email) && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">負責人資訊：</h3>
                  <div className="text-sm space-y-1">
                    {extraInfo.userName && <p>姓名：{extraInfo.userName}</p>}
                    {extraInfo.department && <p>部門：{extraInfo.department}</p>}
                    {extraInfo.team && <p>處室：{extraInfo.team}</p>}
                    {extraInfo.exNumber && <p>分機號碼：{extraInfo.exNumber}</p>}
                    {extraInfo.email && <p>Email：{extraInfo.email}</p>}
                  </div>
                </section>
              </>
            )}

            {extraInfo.formLinks.length > 0 && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">相關連結/文件：</h3>
                  <ul className="list-disc list-inside text-sm">
                    {extraInfo.formLinks.map((f, i) => (
                      <li key={i}>
                        <a
                          href={f.Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {f.Link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            <Dialog.Close className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded text-sm">
              關閉
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {data.type !== "end" && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="s"
          style={{ background: "#0f172a" }}
        />
      )}
    </>
  );
}