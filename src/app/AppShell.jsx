import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AppShell() {
  const { t } = useTranslation();
  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__brand">{t('app.name')}</div>
        <nav className="shell__nav" aria-label="Navigasi utama">
          <NavLink
            to="/favorites"
            className={({ isActive }) => (isActive ? 'shell__link shell__link--active' : 'shell__link')}
          >
            {t('app.favorites')}
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) => (isActive ? 'shell__link shell__link--active' : 'shell__link')}
          >
            {t('app.catalog')}
          </NavLink>
        </nav>
      </aside>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  );
}
