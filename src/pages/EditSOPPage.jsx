import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditSOPPage() {
  const [title, setTitle] = useState('預設標題');
  const [brief, setBrief] = useState('預設簡介');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // 送到後端 API（請自己換成你的 API）
      await axios.post('/api/sop/update', { title, brief });

      // 存到 localStorage，讓 ModuleEditPage 用
      localStorage.setItem('sopInfo', JSON.stringify({ title, brief }));

      // 跳轉到 module-edit 頁
      navigate('/module-edit');
    } catch (error) {
      console.error('更新失敗', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white p-4">NCCU SOP Center</header>

      <main className="flex-grow p-8 bg-gray-100 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">新聘專任教研人員作業流程（ID:）</h1>
        <p className="mb-8">所屬部門：學生事務處</p>

        <div className="flex gap-8 mb-8">
          <div className="flex flex-col">
            <label className="font-bold mb-1">標題</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-64"
              maxLength={30}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold mb-1">簡介</label>
            <input
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="border p-2 w-64"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          進入Module編輯頁
        </button>
      </main>

      <footer className="bg-primary text-white p-4 text-center text-sm">
        NCCU SOP Center Footer
      </footer>
    </div>
  );
}