import { Routes, Route, Navigate } from 'react-router-dom';
import HomePublic from './pages/HomePublic';
import HomePrivate from './pages/HomePrivate';
import SearchResult from './pages/SearchResult';
import SOPDetail from './pages/SOPDetail';
import MySOPList from './pages/MySOPList';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
// ⚠️ In a real app, replace this with auth context / hook ???????????
const isLoggedIn = () => !!localStorage.getItem('user');

export default function App() {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <HomePrivate /> : <HomePublic />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/sop/:id" element={<SOPDetail />} />
      <Route path="/mypage" element={<MySOPList />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}