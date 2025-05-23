import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    
    if (!email || !username || !password) {
      setError('請填寫所有欄位');
      return;
    }
 
    if (password.length < 6) {
      setError('密碼長度至少需為 6 個字元');
      return;
    }
    


    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || '註冊失敗');

      setError('');
      alert('✅ 註冊成功！請使用帳號登入');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };




  return (
    <div className="bg-secondary min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <h2 className="text-2xl font-bold text-center text-primary mb-6">註冊 NCCU SOP Center</h2>

          <input
            type="email"
            placeholder="請輸入電子郵件"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="請輸入使用者名稱"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="請設定密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-between gap-2">
            <button
              onClick={() => navigate('/login')}
              className="w-1/2 bg-white border border-black text-black py-2 rounded"
            >
              返回登入頁面
            </button>
            <button
              onClick={handleRegister}
              className="w-1/2 bg-black text-white py-2 rounded"
            >
              註冊
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
