import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { W_bdg_number_s } from 'nexcomponent-ui/dist/AI/Badge/Badge';
import FavoriteCountProvider, {
  formatBadgeCount,
  formatFavoriteSummary,
  useFavoriteCount,
} from '../features/favorites/FavoriteCountProvider';

// UIMap: 20px high, minimum 29px wide, 6px horizontal padding, Roboto 10/500.
const BADGE_STYLE = {
  width: 'auto',
  minWidth: 29,
  height: 20,
  padding: '0 6px',
  fontSize: 10,
  lineHeight: '11.72px',
};

function FavoriteSummaryBadge() {
  const { t } = useTranslation();
  const { count, summary, ensureSummary } = useFavoriteCount();
  const [hovered, setHovered] = useState(false);
  const display = formatBadgeCount(count);

  // FEAT-004 hides the badge at 0/loading/error; no trigger means no fetch.
  if (display === null) return null;

  // antd 4 Tooltip drops its own hover event while `title` is undefined
  // (`isNoTitle`), so the badge tracks hover itself and drives the tooltip.
  // That keeps the tooltip hidden while the summary is loading or failed,
  // and shows it as soon as the first hover's response lands.
  return (
    <Tooltip
      placement="bottom"
      open={hovered && summary !== null}
      title={summary ? formatFavoriteSummary(summary) : undefined}
      color="#424242"
      transitionName="favorite-summary-fade"
      overlayClassName="favorite-summary-tooltip"
    >
      <span
        className="shell__badge"
        aria-label={t('app.favoriteCount', { count: display })}
        onMouseEnter={() => {
          setHovered(true);
          ensureSummary();
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <W_bdg_number_s content={display} style={BADGE_STYLE} />
      </span>
    </Tooltip>
  );
}

function ShellFrame() {
  const { t } = useTranslation();
  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__brand-row">
          <div className="shell__brand">{t('app.name')}</div>
          <FavoriteSummaryBadge />
        </div>
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

export default function AppShell() {
  return (
    <FavoriteCountProvider>
      <ShellFrame />
    </FavoriteCountProvider>
  );
}
