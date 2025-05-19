import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import * as Dialog from "@radix-ui/react-dialog";

export default function StepNodeView({ data }) {
  const [open, setOpen] = useState(false);
  const [extra, setExtra] = useState(null);

  useEffect(() => {
    if (open) {
      fetch(`/api/sops/${data.id}/display`)
        .then((res) => res.json())
        .then(({ Module_ID, User_Name, Ex_number, form_links }) => {
          setExtra({ User_Name, Ex_number, form_links });
        })
        .catch((err) => console.error("[StepNodeView] 載入額外資料失敗", err));
    }
  }, [open, data.id]);

  return (
    <>
      {data.type !== "start" && (
        <Handle type="target" position={Position.Top} id="t" style={{ background: "#0f172a" }} />
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
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-lg shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-lg font-bold">{data.title}</Dialog.Title>

            {data.details && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">詳細內容：</h3>
                  <p className="whitespace-pre-line text-sm">{data.details}</p>
                </section>
              </>
            )}

            {extra?.User_Name && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">負責人員：</h3>
                  <p className="text-sm">{extra.User_Name}</p>
                </section>
              </>
            )}

            {extra?.Ex_number && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">分機號碼：</h3>
                  <p className="text-sm">{extra.Ex_number}</p>
                </section>
              </>
            )}

            {extra?.form_links?.length > 0 && (
              <>
                <hr />
                <section>
                  <h3 className="font-semibold mb-1">相關文件/連結：</h3>
                  <ul className="list-disc list-inside text-sm">
                    {extra.form_links.map((f, i) => (
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
        <Handle type="source" position={Position.Bottom} id="s" style={{ background: "#0f172a" }} />
      )}
    </>
  );
}
