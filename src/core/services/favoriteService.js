import {
  createFavorite,
  deleteFavorite,
  getFavoriteCount,
  getFavorites,
  getFavoritesSummary,
} from '../api/adapters/favoriteAdapter';

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

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

/**
 * FEAT-004: `payload.count` as a non-negative integer, or `null` for a
 * malformed response so the badge hides instead of showing a wrong 0.
 */
export async function fetchFavoriteCount() {
  const envelope = await getFavoriteCount();
  const count = envelope?.payload?.count;
  return isNonNegativeInteger(count) ? count : null;
}

/**
 * FEAT-005: `payload.total` / `payload.discontinued`, or `null` when the
 * response is malformed or violates `0 <= discontinued <= total`.
 * A bad response is never coerced to `{0,0}` (architecture, REQ-009).
 */
export async function fetchFavoritesSummary() {
  const envelope = await getFavoritesSummary();
  const total = envelope?.payload?.total;
  const discontinued = envelope?.payload?.discontinued;
  if (!isNonNegativeInteger(total) || !isNonNegativeInteger(discontinued)) return null;
  if (discontinued > total) return null;
  return { total, discontinued };
}

export function removeFavorite(itemId) {
  return deleteFavorite(itemId);
}
