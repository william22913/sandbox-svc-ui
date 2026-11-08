import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AvailabilityTag from '../../favorites/components/AvailabilityTag';
import { formatPrice } from '../../../helpers/format';
import placeholder from '../../../assets/placeholder-item.svg';

/**
 * Stand-in for the existing catalog listing page (not part of this feature's
 * API contract). It exists so the empty state's "Jelajahi Katalog" link and the
 * item detail route are reachable.
 */
const DEMO_ITEMS = [
  {
    item_id: '101',
    name: 'Kopi Arabika Gayo 250 g',
    category: 'Makanan & Minuman',
    price: 85000,
    available: true,
  },
  {
    item_id: '102',
    name: 'Teh Hijau Premium 100 g',
    category: 'Makanan & Minuman',
    price: 42500,
    available: true,
  },
  {
    item_id: '103',
    name: 'Cangkir Keramik Handmade',
    category: 'Peralatan Rumah',
    price: 125000,
    available: false,
  },
];

export default function CatalogPage() {
  const { t } = useTranslation();
  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">{t('catalog.title')}</h1>
        <p className="page__subtitle">{t('catalog.subtitle')}</p>
      </header>
      <ul className="catalog-list">
        {DEMO_ITEMS.map((item) => (
          <li key={item.item_id} className="catalog-list__item">
            <img src={placeholder} alt="" width="40" height="40" />
            <div className="catalog-list__body">
              <Link
                to={`/catalog/${item.item_id}`}
                state={{ item, favorited: false }}
                className="favorites-table__name"
              >
                {item.name}
              </Link>
              <span>{formatPrice(item.price)}</span>
            </div>
            <AvailabilityTag available={item.available} />
          </li>
        ))}
      </ul>
    </section>
  );
}
