import { Routes, Route, Navigate } from 'react-router-dom';
import HomePublic from './pages/HomePublic';
import HomePrivate from './pages/HomePrivate';
import SearchResult from './pages/SearchResult';
import SOPDetail from './pages/SOPDetail';

// ⚠️ In a real app, replace this with auth context / hook ???????????
const isLoggedIn = () => !!localStorage.getItem('token');

export default function App() {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <HomePrivate /> : <HomePublic />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/sop/:id" element={<SOPDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}