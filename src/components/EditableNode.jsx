import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';

export default function EditableNode({ id, data, selected, updateNode }) {
  const [open, setOpen]   = useState(false);
  const [name, setName]   = useState(data.label);
  const [detail, setDet]  = useState(data.detail || '');
  const [person, setPer]  = useState(data.person || '');
  const [doc, setDoc]     = useState(data.doc    || '');

  const saveAndClose = () => {
    updateNode(id, { label: name, detail, person, doc });
    setOpen(false);
  };

  return (
    <>
      {/* 節點外觀 */}
      <div
        onDoubleClick={() => setOpen(true)}
        className={`px-10 py-6 rounded-xl border-2 ${selected ? 'border-primary' : 'border-slate-300'} bg-white text-xl font-medium text-center`}
      >
        {name || '(未命名 Module)'}
      </div>

      {/* 上下連接點 */}
      <Handle type="target" position={Position.Top}  />
      <Handle type="source" position={Position.Bottom} />

      {/* Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[460px] rounded-xl p-6 space-y-4 shadow-lg">
            <Dialog.Title className="text-lg font-bold">編輯 Module</Dialog.Title>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Module Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="border rounded w-full px-3 py-1.5"
                placeholder="必填"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Detail</label>
              <textarea value={detail} onChange={e=>setDet(e.target.value)} rows={3}
                className="border rounded w-full px-3 py-1.5"/>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Person in charge</label>
              <input value={person} onChange={e=>setPer(e.target.value)}
                className="border rounded w-full px-3 py-1.5"/>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Document</label>
              <input value={doc} onChange={e=>setDoc(e.target.value)}
                className="border rounded w-full px-3 py-1.5"
                placeholder="可填網址或待串上傳"/>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-1.5 border rounded">取消</button>
              </Dialog.Close>
              <button
                onClick={saveAndClose}
                disabled={!name.trim()}
                className="px-4 py-1.5 bg-primary text-white rounded disabled:opacity-40"
              >
                儲存
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}