import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';

export default function StepNodeEdit({ data, isFirst, isLast }) {
  /* 把節點資料放 local state，Modal 內改完立即影響畫布 */
  const [nodeData, setNodeData] = useState(data);

  const saveToNode = (field, value) => {
    setNodeData((d) => ({ ...d, [field]: value }));
    /* 直接改傳進來的 data → React‑Flow 立即重渲染 */
    data[field] = value;
  };

  return (
    <>
      {!isFirst && <Handle type="target" position={Position.Top} id="t" />}
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-6 py-4 text-center cursor-pointer min-w-[200px]">
            {nodeData.title || '(未命名 Module)'}
          </div>
        </Dialog.Trigger>

        {/* Modal */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] bg-white rounded-xl shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-xl font-bold mb-4">編輯 Module – {data.id}</Dialog.Title>

            {[
              { key:'title',  label:'Module Name*',      tag:'input',    required:true },
              { key:'details',label:'Detail',            tag:'textarea' },
              { key:'person', label:'Person in charge',  tag:'input'    },
              { key:'docs',   label:'Documents(URL)',    tag:'input'    },
            ].map((f)=>(
              <div key={f.key}>
                <label className="block font-semibold mb-1">{f.label}</label>
                {f.tag==='textarea' ? (
                  <textarea
                    rows={3}
                    value={nodeData[f.key]||''}
                    onChange={(e)=> saveToNode(f.key, e.target.value)}
                    className="border rounded w-full px-3 py-1.5 resize-none"
                  />
                ):(
                  <input
                    value={nodeData[f.key]||''}
                    onChange={(e)=> saveToNode(f.key, e.target.value)}
                    className="border rounded w-full px-3 py-1.5"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close className="px-4 py-1.5 border rounded hover:bg-gray-100">
                取消
              </Dialog.Close>
              <Dialog.Close className="px-6 py-1.5 bg-primary text-white rounded hover:bg-primary/90">
                儲存
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {!isLast && <Handle type="source" position={Position.Bottom} id="s" />}
    </>
  );
}