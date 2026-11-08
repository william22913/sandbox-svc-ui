import client from '../axios/client';

/**
 * GET /favorites?page=&page_size=
 * The backend contract is `nexcommon`'s paged envelope: data + page + page_size + total.
 */
export async function getFavorites({ page, pageSize }) {
  const { data } = await client.get('/favorites', {
    params: { page, page_size: pageSize },
  });
  return data;
}

/**
 * GET /v1/favorites/count — FEAT-004 badge count. The path carries `/v1`:
 * nginx strips only `/api`, so `/api/v1/...` reaches the backend as `/v1/...`.
 */
export async function getFavoriteCount() {
  const { data } = await client.get('/v1/favorites/count');
  return data;
}

/** GET /v1/favorites/summary — FEAT-005 aggregate, no input (REQ-001/REQ-011). */
export async function getFavoritesSummary() {
  const { data } = await client.get('/v1/favorites/summary');
  return data;
}

/** POST /favorites { item_id } — idempotent (REQ-005). */
export async function createFavorite(itemId) {
  const { data } = await client.post('/favorites', { item_id: itemId });
  return data;
}

/** DELETE /favorites/{item_id} — 204 on success, 404 when not in this user's list (REQ-008). */
export async function deleteFavorite(itemId) {
  await client.delete(`/favorites/${encodeURIComponent(itemId)}`);
}
