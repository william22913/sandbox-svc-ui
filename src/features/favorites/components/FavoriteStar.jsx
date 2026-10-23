import { Button } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useFavoriteStar from '../hooks/useFavoriteStar';

export default function FavoriteStar({ itemId, initialFavorited = false, size = 26 }) {
  const { t } = useTranslation();
  const { favorited, inFlight, error, toggle } = useFavoriteStar(itemId, initialFavorited);
  const label = favorited ? t('favorites.saved') : t('favorites.save');

  return (
    <div className="favorite-star">
      {error && (
        <span className="favorite-star__error" role="alert">
          {t(`favorites.${error}`)}
        </span>
      )}
      <Button
        type="text"
        className="favorite-star__button"
        aria-label={label}
        aria-pressed={favorited}
        title={label}
        disabled={inFlight}
        onClick={toggle}
        style={{ opacity: inFlight ? 0.6 : 1 }}
      >
        {favorited ? (
          <StarFilled style={{ fontSize: size, color: '#13A1DC' }} />
        ) : (
          <StarOutlined style={{ fontSize: size, color: '#ACACAC' }} />
        )}
      </Button>
    </div>
  );
}
