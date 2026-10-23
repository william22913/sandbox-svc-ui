import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FavoriteStar from '../../favorites/components/FavoriteStar';
import AvailabilityTag from '../../favorites/components/AvailabilityTag';
import { formatPrice } from '../../../helpers/format';
import placeholder from '../../../assets/placeholder-item.svg';

/**
 * The item detail page belongs to the existing catalog product. This repo has
 * no catalog API contract, so the page renders the item passed by the catalog
 * or favorites list, and falls back to the route id for a direct deep link.
 */
export default function ItemDetailPage() {
  const { t } = useTranslation();
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item || {
    item_id: itemId,
    name: `Item ${itemId}`,
    category: '-',
    price: null,
    available: true,
  };
  const favorited = Boolean(location.state?.favorited);

  return (
    <section className="page detail">
      <div className="detail__topbar">
        <Button
          type="text"
          aria-label="Kembali"
          title="Kembali"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
      </div>

      <header className="detail__header">
        <h1 className="page__title">{item.name}</h1>
        <FavoriteStar itemId={item.item_id} initialFavorited={favorited} />
      </header>

      <div className="detail__card">
        <img
          className="detail__image"
          src={item.image_url || placeholder}
          alt={item.name}
          width="64"
          height="64"
        />
        <dl className="detail__fields">
          <div>
            <dt>{t('favorites.columns.category')}</dt>
            <dd>{item.category || '-'}</dd>
          </div>
          <div>
            <dt>{t('favorites.columns.price')}</dt>
            <dd>{formatPrice(item.price)}</dd>
          </div>
          <div>
            <dt>{t('favorites.columns.availability')}</dt>
            <dd>
              <AvailabilityTag available={item.available !== false} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
