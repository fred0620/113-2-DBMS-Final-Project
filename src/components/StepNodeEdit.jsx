import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';


export default function StepNodeEdit({ data, isFirst, isLast }) {
  const safeLinks = Array.isArray(data.formLinks)
    ? data.formLinks.map((x) =>
        typeof x === 'string'
          ? { Link: x, Link_Name: '' }
          : { Link: x?.Link || '', Link_Name: x?.Link_Name || '' }
      )
    : [{ Link: '', Link_Name: '' }];

  const [form, setForm] = useState(null);
  const [open, setOpen] = useState(false);
  const [personOptions, setPersonOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const removeFormLinkField = (index) => {
  setForm((prev) => ({
    ...prev,
    formLinks: prev.formLinks.filter((_, i) => i !== index),
  }));
};


  const initForm = () => ({
    title: data.title || '',
    details: data.details || '',
    person: data.person || '',
    person_team: data.person_team || '',
    person_name: data.person_name || '',
    formLinks: safeLinks.length > 0 ? safeLinks : [{ Link: '', Link_Name: '' }],
  });

  const isSelectedPersonInOptions =
    form && personOptions.some((p) => p.Administrator_ID === form.person);

  // reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(initForm());
      setSearchTerm('');
    }
  }, [open]);

  useEffect(() => {
    const controller = new AbortController();
    const delay = setTimeout(async () => {
      try {
        const url = searchTerm.trim()
          ? `/api/users/search?keyword=${searchTerm.trim()}`
          : '/api/users/search';

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('fetch failed');
        const result = await res.json();
        setPersonOptions(result.data || []);
      } catch (err) {
        console.error('[StepNodeEdit] 負責人搜尋失敗:', err);
      }
    }, 400);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [searchTerm]);

  const handleChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFormLinkChange = (i, key, val) => {
    const updated = [...form.formLinks];
    updated[i] = { ...updated[i], [key]: val };
    setForm((prev) => ({ ...prev, formLinks: updated }));
  };

  const addFormLinkField = () => {
    setForm((prev) => ({
      ...prev,
      formLinks: [...prev.formLinks, { Link: '', Link_Name: '' }],
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert('Module Name 為必填！');

      return;
    }

    const formatted = {
      ...form,
      staff_in_charge: form.person,
      formLinks: form.formLinks.filter((l) => l.Link.trim()),
    };

    data.onSave?.(formatted);
    //Object.assign(data, form); // 覆蓋外部 data
    setOpen(false);
  };

  return (
    <>
      {!isFirst && <Handle type="target" position={Position.Top} id="t" />}

      <Dialog.Root
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setForm(initForm());
            setSearchTerm('');
          }
        }}
      >
        <Dialog.Trigger asChild>
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-6 py-4 text-center cursor-pointer min-w-[200px]">
            {data.title || '(未命名 Module)'}
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] bg-white rounded-xl shadow-lg p-6 space-y-4 z-50">
            <Dialog.Title className="text-xl font-bold mb-4">
              編輯 Module {data.id}
            </Dialog.Title>

            {form && (
              <>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜尋姓名或部門"
                    className="border rounded w-full px-3 py-1.5"
                  />
                  <select
                    value={form.person}
                    onChange={(e) => {
                      const selected = personOptions.find(p => p.Administrator_ID === e.target.value);
                      handleChange('person', e.target.value);
                      handleChange('person_name', selected?.User_Name || '');
                      handleChange('person_team', selected?.Team_Name || '');
                    }}
                    className="mt-2 border rounded w-full px-3 py-1.5"
                  >
                    <option value="">請選擇負責人</option>

                    {form.person && !isSelectedPersonInOptions && (
                      <option value={form.person}>
                        {form.person_name || '未知'}（{form.person_team || '無部門'}）
                      </option>
                    )}

                    {personOptions.map((p) => (
                      <option key={p.Administrator_ID} value={p.Administrator_ID}>
                        {p.User_Name}（{p.Team_Name}）
                      </option>
                    ))}
                  </select>

                </div>

                <div>
                  <label className="block font-semibold mb-1">相關連結/文件</label>
                  {form.formLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <input
                        value={link.Link_Name}
                        onChange={(e) =>
                          handleFormLinkChange(idx, 'Link_Name', e.target.value)
                        }
                        placeholder="名稱"
                        className="w-1/3 border rounded px-3 py-1.5"
                      />
                      <input
                        value={link.Link}
                        onChange={(e) =>
                          handleFormLinkChange(idx, 'Link', e.target.value)
                        }
                        placeholder="URL"
                        className="w-2/3 border rounded px-3 py-1.5"
                      />
                      {form.formLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormLinkField(idx)}
                          className="text-red-600 text-sm px-1"
                          title="刪除此連結"
                        >
                          ✕
                        </button>
                      )}
                    </div>
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
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm">
                        刪除
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                      <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-white rounded-lg shadow-lg p-6 space-y-5 z-50">
                        <AlertDialog.Title className="text-lg font-bold">
                          確認刪除此 Module？
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-sm">
                          這個動作無法復原。
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-3 pt-4">
                          <AlertDialog.Cancel asChild>
                            <button className="border px-4 py-1.5 rounded text-sm">
                              取消
                            </button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action asChild>
                            <button
                              onClick={data.onDelete}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm"
                            >
                              確認刪除
                            </button>
                          </AlertDialog.Action>
                        </div>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>

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
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {!isLast && <Handle type="source" position={Position.Bottom} id="s" />}
    </>
  );
}
