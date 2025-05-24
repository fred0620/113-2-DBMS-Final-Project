import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';

export default function StepNodeEdit({ data, isFirst, isLast }) {
  const safeLinks = Array.isArray(data.formLinks)
    ? data.formLinks.map((x) => typeof x === 'string' ? x : x?.Link || '')
    : [''];

  const [form, setForm] = useState({
    title: data.title || '',
    details: data.details || '',
    person: data.person || '',
    formLinks: safeLinks.length > 0 ? safeLinks : [''],
  });

  const [open, setOpen] = useState(false);

  const handleChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFormLinkChange = (i, val) => {
    const updated = [...form.formLinks];
    updated[i] = val;
    setForm((prev) => ({ ...prev, formLinks: updated }));
  };

  const addFormLinkField = () => {
    setForm((prev) => ({ ...prev, formLinks: [...prev.formLinks, ''] }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert('Module Name 為必填！');
      return;
    }

    const formatted = {
      ...form,
      docs: undefined,
      formLinks: form.formLinks
        .filter((url) => url.trim())
        .map((url) => ({ Link: url })),
    };

    data.onSave?.(formatted); 
    Object.assign(data, form); =
    setOpen(false);
  };

  return (
    <>
      {!isFirst && <Handle type="target" position={Position.Top} id="t" />}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-6 py-4 text-center cursor-pointer min-w-[200px]">
            {form.title || '(未命名 Module)'}
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

            <div>
              <label className="block font-semibold mb-1">Module Name*</label>
              <input
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="border rounded w-full px-3 py-1.5"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">詳細內容</label>
              <textarea
                rows={3}
                value={form.details}
                onChange={(e) => handleChange('details', e.target.value)}
                className="border rounded w-full px-3 py-1.5 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">負責人</label>
              <input
                value={form.person}
                onChange={(e) => handleChange('person', e.target.value)}
                className="border rounded w-full px-3 py-1.5"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">相關連結/文件 (URL)</label>
              {form.formLinks.map((link, idx) => (
                <input
                  key={idx}
                  value={link}
                  onChange={(e) => handleFormLinkChange(idx, e.target.value)}
                  className="mb-2 border rounded w-full px-3 py-1.5"
                />
              ))}
              <button
                onClick={addFormLinkField}
                className="text-blue-600 text-sm mt-1 underline"
                type="button"
              >
                + 新增一個連結/文件欄位
              </button>
            </div>

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