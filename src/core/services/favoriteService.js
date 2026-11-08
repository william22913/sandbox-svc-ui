import {
  createFavorite,
  deleteFavorite,
  getFavorites,
} from '../api/adapters/favoriteAdapter';

/**
 * Maps the paged envelope into page state. Keeps the UI independent of the
 * envelope field names (architecture: data + page + page_size + total).
 */
export async function fetchFavorites({ page, pageSize }) {
  const envelope = await getFavorites({ page, pageSize });
  return {
    items: Array.isArray(envelope?.data) ? envelope.data : [],
    page: Number(envelope?.page) || page,
    pageSize: Number(envelope?.page_size) || pageSize,
    total: Number(envelope?.total) || 0,
  };
}

export function addFavorite(itemId) {
  return createFavorite(itemId);
}

export function removeFavorite(itemId) {
  return deleteFavorite(itemId);
}
