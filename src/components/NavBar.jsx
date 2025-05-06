import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function NavBar() {
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem('user');

  const handleAuth = () => {
    if (localStorage.getItem('user')) {
      localStorage.removeItem('user'); // 登出
    } else {
      navigate('/login'); // 未登入就去登入
    }
    location.reload(); // 或用狀態刷新頁面
  };
  

  return (
    <nav className="w-full bg-gray-100 border-b border-gray-200">
      <div className="mx-auto max-w-7xl flex items-center justify-between py-1 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="NCCU SOP Center logo" className="w-24 h-24 md:w-20 md:h-20" />
          <span className="font-bold text-xl text-primary">NCCU SOP Center</span>
        </Link>

        <div className="hidden md:flex border rounded-md bg-white/60 backdrop-blur px-1 py-1">
          <Link to="/" className="flex-1 px-4 py-1 text-center hover:underline whitespace-nowrap">首頁</Link>
          <Link to="/favorites" className="flex-1 px-4 py-1 text-center hover:underline whitespace-nowrap">SOP收藏</Link>
          <Link to="/mypage" className="flex-1 px-4 py-1 text-center hover:underline whitespace-nowrap">我的SOP</Link>
          <button onClick={handleAuth} className="flex-1 px-4 py-1 text-center hover:underline whitespace-nowrap">
            {loggedIn ? '登出' : '登入/註冊'}
          </button>
        </div>
      </div>
    </nav>
  );
}
