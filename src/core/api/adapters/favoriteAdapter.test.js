import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../axios/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import client from '../axios/client';
import {
  createFavorite,
  deleteFavorite,
  getFavoriteCount,
  getFavorites,
  getFavoritesSummary,
} from './favoriteAdapter';

describe('favoriteAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the paging contract as page and page_size (REQ-010)', async () => {
    client.get.mockResolvedValue({ data: { data: [], page: 2, page_size: 10, total: 0 } });

    await getFavorites({ page: 2, pageSize: 10 });

    expect(client.get).toHaveBeenCalledWith('/favorites', {
      params: { page: 2, page_size: 10 },
    });
  });

  it('posts item_id to /favorites (REQ-001)', async () => {
    client.post.mockResolvedValue({ data: null });

    await createFavorite(101);

    expect(client.post).toHaveBeenCalledWith('/favorites', { item_id: 101 });
  });

  it('deletes the item route (REQ-003)', async () => {
    client.delete.mockResolvedValue({ status: 204 });

    await deleteFavorite('item/1');

    expect(client.delete).toHaveBeenCalledWith('/favorites/item%2F1');
  });

  it('requests the FEAT-004 count from the /v1 path', async () => {
    client.get.mockResolvedValue({ data: { payload: { count: 5 } } });

    await getFavoriteCount();

    expect(client.get).toHaveBeenCalledWith('/v1/favorites/count');
  });

  it('requests the FEAT-005 summary from the /v1 path with no input', async () => {
    client.get.mockResolvedValue({ data: { payload: { total: 5, discontinued: 1 } } });

    await getFavoritesSummary();

    expect(client.get).toHaveBeenCalledWith('/v1/favorites/summary');
  });
});
