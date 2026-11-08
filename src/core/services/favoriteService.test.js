import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/adapters/favoriteAdapter', () => ({
  getFavorites: vi.fn(),
  createFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
}));

import { getFavorites } from '../api/adapters/favoriteAdapter';
import { fetchFavorites } from './favoriteService';

describe('favoriteService.fetchFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps the nexcommon paged envelope onto page state', async () => {
    getFavorites.mockResolvedValue({
      data: [{ item_id: 1 }],
      page: 3,
      page_size: 50,
      total: 137,
    });

    await expect(fetchFavorites({ page: 1, pageSize: 20 })).resolves.toEqual({
      items: [{ item_id: 1 }],
      page: 3,
      pageSize: 50,
      total: 137,
    });
  });

  it('tolerates a missing body with safe defaults', async () => {
    getFavorites.mockResolvedValue(undefined);

    await expect(fetchFavorites({ page: 1, pageSize: 20 })).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
    });
  });
});
