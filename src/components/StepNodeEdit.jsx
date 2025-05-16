import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';

export default function StepNodeEdit({ data, isFirst, isLast }) {
  // 一律用 local state；不要直接 setNodeData(data)
  const [form, setForm] = useState({
    title  : data.title  || '',
    details: data.details|| '',
    person : data.person || '',
    docs   : data.docs   || '',
  });
  const [open, setOpen] = useState(false);

  /** 更新欄位 */
  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  /** 儲存 */
  const handleSave = () => {
    if (!form.title.trim()) {
      alert('Module Name 為必填！');
      return;
    }

    data.onSave(form);

    // 同步更新當前節點顯示的文字
    Object.assign(data, form);

    setOpen(false);
  };

  return (
    <>
      {!isFirst && <Handle type="target" position={Position.Top} id="t" />}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg
                          px-6 py-4 text-center cursor-pointer min-w-[200px]">
            {form.title || '(未命名 Module)'}
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[520px] bg-white rounded-xl shadow-lg p-6 space-y-4 z-50"
            aria-label="編輯模組"
          >
            <Dialog.Title className="text-xl font-bold mb-4">
              編輯 Module – {data.id}
            </Dialog.Title>

            {/* 表單欄位 */}
            {[
              { key:'title'  , label:'Module Name*', tag:'input',   required:true },
              { key:'details', label:'Detail'       , tag:'textarea' },
              { key:'person' , label:'Person in charge', tag:'input' },
              { key:'docs'   , label:'Documents(URL)', tag:'input' },
            ].map(f => (
              <div key={f.key}>
                <label className="block font-semibold mb-1">{f.label}</label>
                {f.tag === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={form[f.key]}
                    onChange={e => handleChange(f.key, e.target.value)}
                    className="border rounded w-full px-3 py-1.5 resize-none"
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={e => handleChange(f.key, e.target.value)}
                    className="border rounded w-full px-3 py-1.5"
                  />
                )}
              </div>
            ))}

            {/* 底部按鈕 */}
            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button className="px-4 py-1.5 border rounded hover:bg-gray-100">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
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