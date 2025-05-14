import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';

export default function StepNodeEdit({ data, isFirst, isLast }) {
  const [nodeData, setNodeData] = useState(data);
  const [open, setOpen] = useState(false); // ← 控制 Modal 開關

  const saveToNode = (field, value) => {
    setNodeData((d) => ({ ...d, [field]: value }));
    data[field] = value; // 同步更新原始 data
  };

  return (
    <>
      {!isFirst && <Handle type="target" position={Position.Top} id="t" />}
      
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-6 py-4 text-center cursor-pointer min-w-[200px]">
            {nodeData.title || '(未命名 Module)'}
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] bg-white rounded-xl shadow-lg p-6 space-y-4 z-50"
            aria-label="編輯模組"
          >
            <Dialog.Title className="text-xl font-bold mb-4">
              編輯 Module – {data.id}
            </Dialog.Title>

            {[
              { key: 'title', label: 'Module Name*', tag: 'input', required: true },
              { key: 'details', label: 'Detail', tag: 'textarea' },
              { key: 'person', label: 'Person in charge', tag: 'input' },
              { key: 'docs', label: 'Documents(URL)', tag: 'input' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block font-semibold mb-1">{f.label}</label>
                {f.tag === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={nodeData[f.key] || ''}
                    onChange={(e) => saveToNode(f.key, e.target.value)}
                    className="border rounded w-full px-3 py-1.5 resize-none"
                  />
                ) : (
                  <input
                    value={nodeData[f.key] || ''}
                    onChange={(e) => saveToNode(f.key, e.target.value)}
                    className="border rounded w-full px-3 py-1.5"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 border rounded hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-1.5 bg-primary text-white rounded hover:bg-primary/90"
              >
                儲存
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {!isLast && <Handle type="source" position={Position.Bottom} id="s" />}
    </>
  );
}