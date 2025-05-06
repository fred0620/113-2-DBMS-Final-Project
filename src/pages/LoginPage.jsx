import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('登入失敗，請檢查帳密');

      const { user } = await res.json(); // 👈 只接收 user，不處理 token
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-secondary min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <h2 className="text-2xl font-bold text-center text-primary mb-6">登入 NCCU SOP Center</h2>

          <input
            type="email"
            placeholder="請輸入電子郵件"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="請輸入密碼..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-between gap-2">
            <button
              onClick={() => navigate('/register')}
              className="w-1/2 bg-white border border-black text-black py-2 rounded"
            >
              非教職員工註冊
            </button>
            <button
              onClick={handleLogin}
              className="w-1/2 bg-black text-white py-2 rounded"
            >
              登入
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
