import { useCallback, useState } from 'react';
import { addFavorite, removeFavorite } from '../../../core/services/favoriteService';
import { isLimitReached, isUnauthorized } from '../../../helpers/redirectToLogin';

/**
 * Optimistic star toggle (architecture: flip immediately, roll back on failure,
 * inline error next to the star, no toast). REQ-001/003/007/011.
 */
export default function useFavoriteStar(itemId, initialFavorited = false) {
  const [favorited, setFavorited] = useState(Boolean(initialFavorited));
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState(null);

  const toggle = useCallback(async () => {
    if (inFlight) return;
    setError(null);
    const next = !favorited;
    setFavorited(next);
    setInFlight(true);
    try {
      if (next) await addFavorite(itemId);
      else await removeFavorite(itemId);
    } catch (err) {
      setFavorited(!next);
      if (isUnauthorized(err)) return;
      setError(isLimitReached(err) ? 'capError' : 'saveError');
    } finally {
      setInFlight(false);
    }
  }, [favorited, inFlight, itemId]);

  return { favorited, inFlight, error, toggle };
}
