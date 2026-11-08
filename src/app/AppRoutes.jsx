import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './AppShell';
import FavoritesPage from '../features/favorites/pages/FavoritesPage';
import CatalogPage from '../features/catalog/pages/CatalogPage';
import ItemDetailPage from '../features/catalog/pages/ItemDetailPage';
import LoginPage from '../features/auth/pages/LoginPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/favorites" replace />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:itemId" element={<ItemDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/favorites" replace />} />
    </Routes>
  );
}
