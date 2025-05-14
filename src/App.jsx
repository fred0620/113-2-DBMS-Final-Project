import { Routes, Route, Navigate } from 'react-router-dom';
import HomePublic from './pages/HomePublic';
import HomePrivate from './pages/HomePrivate';
import SearchResult from './pages/SearchResult';
import SOPDetail from './pages/SOPDetail';
import MySOPList from './pages/MySOPList';

/*
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FavoriteSOPPage from './pages/FavoriteSOPPage';

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/favorites" element={<FavoriteSOPPage />} />  
*/

import ModulePage from './pages/ModulePage'; 
import EditSOPPage from './pages/EditSOPPage';
import ModuleEditPage from './pages/ModuleEditPage';
import ModuleCreatePage from './pages/ModuleCreatePage';

const isLoggedIn = () => !!localStorage.getItem('user');

export default function App() {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <HomePrivate /> : <HomePublic />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/sop/:id" element={<SOPDetail />} />

      <Route path="/mypage" element={<MySOPList />} />
      <Route path="/sop/:id/edit" element={<EditSOPPage />} />
      <Route path="/module/:id" element={<ModulePage />} />
      <Route path="/module/:id/edit" element={<ModuleEditPage />} />
      <Route path="/module/:id/create" element={<ModuleCreatePage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}