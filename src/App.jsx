import { Routes, Route, Navigate } from 'react-router-dom';
import HomePublic from './pages/HomePublic';
import HomePrivate from './pages/HomePrivate';
import SearchResult from './pages/SearchResult';
import SOPDetail from './pages/SOPDetail';
import MySOPList from './pages/MySOPList';
import ModulePage from './pages/ModulePage'; 
import EditSOPPage from './pages/EditSOPPage';
import ModuleEditPage from './pages/ModuleEditPage';
import ModuleCreatePage from './pages/ModuleCreatePage';

const isLoggedIn = () => !!localStorage.getItem('token');

export default function App() {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <HomePrivate /> : <HomePublic />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/sop/:id" element={<SOPDetail />} />
      <Route path="/mypage" element={<MySOPList />} />
      <Route path="/module/:id" element={<ModulePage />} /> 
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/sop/:id/edit" element={<EditSOPPage />} />
      <Route path="/module/:id/edit" element={<ModuleEditPage />} />
      <Route path="/module/:id/create" element={<ModuleCreatePage />} /> 
    </Routes>
  );
}