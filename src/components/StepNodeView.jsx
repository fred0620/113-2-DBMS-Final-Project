import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';

export default function StepNodeView({ data }) {
  const [open, setOpen] = useState(false);
  const { isFirst, isLast } = data;   // ← 由 ModulePage 傳入

  return (
    <>
      {/* 只有「非第一個節點」才放 Top‑Handle */}
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Top}
          id="t"
          style={{ background: '#0f172a' }}
        />
      )}

      {/* 框框本體 & 彈窗觸發 */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 rounded-lg
                          px-8 py-6 min-w-[220px] text-center text-sm
                          border border-slate-400 cursor-pointer">
            {/* 自動換行顯示較長文字 */}
            <span className="break-words">{data.brief}</span>
          </div>
        </Dialog.Trigger>

        {/* === Modal 內容（純檢視版）=== */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[420px] bg-white rounded-lg shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-lg font-bold">{data.title}</Dialog.Title>

            {data.details && (
              <section>
                <h3 className="font-semibold mb-1">Detail</h3>
                <p className="whitespace-pre-line text-sm">{data.details}</p>
              </section>
            )}

            {data.person && (
              <section>
                <h3 className="font-semibold mb-1">Person in charge</h3>
                <p className="text-sm">{data.person}</p>
              </section>
            )}

            {!!data.docs?.length && (
              <section>
                <h3 className="font-semibold mb-1">Documents</h3>
                <ul className="list-disc list-inside text-sm">
                  {data.docs.map((d,i)=>(
                    <li key={i}>
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 underline">
                        {d.type.toUpperCase()}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Dialog.Close
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded text-sm">
              關閉
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 只有「非最後一個節點」才放 Bottom‑Handle */}
      {!isLast && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="s"
          style={{ background: '#0f172a' }}
        />
      )}
    </>
  );
}