import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/adapters/favoriteAdapter', () => ({
  getFavorites: vi.fn(),
  getFavoriteCount: vi.fn(),
  getFavoritesSummary: vi.fn(),
  createFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
}));

import {
  getFavoriteCount,
  getFavorites,
  getFavoritesSummary,
} from '../api/adapters/favoriteAdapter';
import {
  fetchFavoriteCount,
  fetchFavorites,
  fetchFavoritesSummary,
} from './favoriteService';

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

describe('favoriteService.fetchFavoritesSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const envelope = (payload) => ({ success: true, header: {}, payload });

  it('maps payload.total and payload.discontinued', async () => {
    getFavoritesSummary.mockResolvedValue(envelope({ total: 5, discontinued: 1 }));

    await expect(fetchFavoritesSummary()).resolves.toEqual({ total: 5, discontinued: 1 });
  });

  it('accepts the zero-favorites response', async () => {
    getFavoritesSummary.mockResolvedValue(envelope({ total: 0, discontinued: 0 }));

    await expect(fetchFavoritesSummary()).resolves.toEqual({ total: 0, discontinued: 0 });
  });

  it('accepts every favorite being discontinued', async () => {
    getFavoritesSummary.mockResolvedValue(envelope({ total: 3, discontinued: 3 }));

    await expect(fetchFavoritesSummary()).resolves.toEqual({ total: 3, discontinued: 3 });
  });

  it('returns null for a missing payload', async () => {
    getFavoritesSummary.mockResolvedValue(undefined);

    await expect(fetchFavoritesSummary()).resolves.toBeNull();
  });

  it('returns null for non-integer values instead of coercing to zero', async () => {
    getFavoritesSummary.mockResolvedValue(envelope({ total: '5', discontinued: 1 }));

    await expect(fetchFavoritesSummary()).resolves.toBeNull();
  });

  it('returns null for negative values', async () => {
    getFavoritesSummary.mockResolvedValue(envelope({ total: -1, discontinued: 0 }));

    await expect(fetchFavoritesSummary()).resolves.toBeNull();
  });

  it('returns null when discontinued exceeds total', async () => {
    getFavoritesSummary.mockResolvedValue(envelope({ total: 2, discontinued: 3 }));

    await expect(fetchFavoritesSummary()).resolves.toBeNull();
  });
});

describe('favoriteService.fetchFavoriteCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps payload.count', async () => {
    getFavoriteCount.mockResolvedValue({ payload: { count: 12 } });

    await expect(fetchFavoriteCount()).resolves.toBe(12);
  });

  it('returns null for a malformed response so the badge hides', async () => {
    getFavoriteCount.mockResolvedValue({ payload: {} });

    await expect(fetchFavoriteCount()).resolves.toBeNull();
  });

  it('returns null for a non-integer count', async () => {
    getFavoriteCount.mockResolvedValue({ payload: { count: '12' } });

    await expect(fetchFavoriteCount()).resolves.toBeNull();
  });
});
