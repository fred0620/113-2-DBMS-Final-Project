import { Routes, Route, Navigate } from 'react-router-dom';
import HomePublic from './pages/HomePublic';
import HomePrivate from './pages/HomePrivate';
import SearchResult from './pages/SearchResult';
import SOPDetail from './pages/SOPDetail';
<<<<<<< HEAD
=======
import MySOPList from './pages/MySOPList';
import ModulePage from './pages/ModulePage'; 
import EditSOPPage from './pages/EditSOPPage';
import ModuleEditPage from './pages/ModuleEditPage';
import ModuleCreatePage from './pages/ModuleCreatePage';
>>>>>>> fa49802 (WIP: 備份 feature/frontend/my-sop 的最新進度(還有很多沒改完)，包括新增和修改頁面)

const isLoggedIn = () => !!localStorage.getItem('token');

export default function App() {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <HomePrivate /> : <HomePublic />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/sop/:id" element={<SOPDetail />} />
<<<<<<< HEAD
=======
      <Route path="/mypage" element={<MySOPList />} />
      <Route path="/module/:id" element={<ModulePage />} /> 
>>>>>>> fa49802 (WIP: 備份 feature/frontend/my-sop 的最新進度(還有很多沒改完)，包括新增和修改頁面)
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/sop/:id/edit" element={<EditSOPPage />} />
      <Route path="/module/:id/edit" element={<ModuleEditPage />} />
      <Route path="/module/:id/create" element={<ModuleCreatePage />} /> 
    </Routes>
  );
}