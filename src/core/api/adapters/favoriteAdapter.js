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

/** POST /favorites { item_id } — idempotent (REQ-005). */
export async function createFavorite(itemId) {
  const { data } = await client.post('/favorites', { item_id: itemId });
  return data;
}

/** DELETE /favorites/{item_id} — 204 on success, 404 when not in this user's list (REQ-008). */
export async function deleteFavorite(itemId) {
  await client.delete(`/favorites/${encodeURIComponent(itemId)}`);
}
