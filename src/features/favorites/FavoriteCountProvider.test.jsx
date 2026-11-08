import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../core/services/favoriteService', () => ({
  fetchFavoriteCount: vi.fn(),
  fetchFavoritesSummary: vi.fn(),
}));

import { fetchFavoriteCount, fetchFavoritesSummary } from '../../core/services/favoriteService';
import FavoriteCountProvider, {
  formatBadgeCount,
  formatFavoriteSummary,
  useFavoriteCount,
} from './FavoriteCountProvider';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('formatFavoriteSummary', () => {
  it('renders the literal spec template with exact integers', () => {
    expect(formatFavoriteSummary({ total: 0, discontinued: 0 })).toBe(
      '0 favorites (0 discontinued)'
    );
    expect(formatFavoriteSummary({ total: 1, discontinued: 0 })).toBe(
      '1 favorites (0 discontinued)'
    );
    expect(formatFavoriteSummary({ total: 3, discontinued: 1 })).toBe(
      '3 favorites (1 discontinued)'
    );
    expect(formatFavoriteSummary({ total: 3, discontinued: 3 })).toBe(
      '3 favorites (3 discontinued)'
    );
    expect(formatFavoriteSummary({ total: 100, discontinued: 12 })).toBe(
      '100 favorites (12 discontinued)'
    );
    expect(formatFavoriteSummary({ total: 150, discontinued: 3 })).toBe(
      '150 favorites (3 discontinued)'
    );
  });
});

describe('formatBadgeCount', () => {
  it('hides at null and zero, caps at 99+', () => {
    expect(formatBadgeCount(null)).toBeNull();
    expect(formatBadgeCount(0)).toBeNull();
    expect(formatBadgeCount(1)).toBe('1');
    expect(formatBadgeCount(99)).toBe('99');
    expect(formatBadgeCount(100)).toBe('99+');
    expect(formatBadgeCount(500)).toBe('99+');
  });
});

describe('FavoriteCountProvider', () => {
  let latest;
  let container;
  let root;

  function Probe() {
    latest = useFavoriteCount();
    return null;
  }

  async function mount() {
    await act(async () => {
      root.render(
        <FavoriteCountProvider>
          <Probe />
        </FavoriteCountProvider>
      );
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    fetchFavoriteCount.mockResolvedValue(null);
    fetchFavoritesSummary.mockResolvedValue(null);
    latest = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('fetches the count on mount and never fetches the summary', async () => {
    fetchFavoriteCount.mockResolvedValue(5);
    await mount();

    expect(fetchFavoriteCount).toHaveBeenCalledTimes(1);
    expect(fetchFavoritesSummary).not.toHaveBeenCalled();
    expect(latest.count).toBe(5);
    expect(latest.summary).toBeNull();
    expect(latest.summaryStatus).toBe('idle');
  });

  it('hides the badge when the count is null or malformed', async () => {
    fetchFavoriteCount.mockResolvedValue(null);
    await mount();

    expect(latest.count).toBeNull();
  });

  it('fetches the summary on the first hover only', async () => {
    fetchFavoriteCount.mockResolvedValue(5);
    fetchFavoritesSummary.mockResolvedValue({ total: 5, discontinued: 1 });
    await mount();

    await act(async () => {
      latest.ensureSummary();
    });

    expect(fetchFavoritesSummary).toHaveBeenCalledTimes(1);
    expect(latest.summaryStatus).toBe('ready');
    expect(latest.summary).toEqual({ total: 5, discontinued: 1 });

    await act(async () => {
      latest.ensureSummary();
    });

    expect(fetchFavoritesSummary).toHaveBeenCalledTimes(1);
  });

  it('stays in error with no values, then retries on the next hover', async () => {
    fetchFavoriteCount.mockResolvedValue(5);
    fetchFavoritesSummary
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValueOnce({ total: 3, discontinued: 1 });
    await mount();

    await act(async () => {
      latest.ensureSummary();
    });
    expect(latest.summaryStatus).toBe('error');
    expect(latest.summary).toBeNull();

    await act(async () => {
      latest.ensureSummary();
    });
    expect(fetchFavoritesSummary).toHaveBeenCalledTimes(2);
    expect(latest.summaryStatus).toBe('ready');
    expect(latest.summary).toEqual({ total: 3, discontinued: 1 });
  });

  it('treats a malformed summary as an error, not as zeros', async () => {
    fetchFavoriteCount.mockResolvedValue(5);
    fetchFavoritesSummary.mockResolvedValue(null);
    await mount();

    await act(async () => {
      latest.ensureSummary();
    });

    expect(latest.summaryStatus).toBe('error');
    expect(latest.summary).toBeNull();
  });

  it('drops a fetched summary before refetching after an action', async () => {
    fetchFavoriteCount.mockResolvedValue(5);
    fetchFavoritesSummary.mockResolvedValueOnce({ total: 5, discontinued: 1 });
    await mount();

    await act(async () => {
      latest.ensureSummary();
    });
    expect(latest.summary).toEqual({ total: 5, discontinued: 1 });

    let resolveRefresh;
    fetchFavoritesSummary.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      })
    );
    act(() => {
      latest.refreshSummary();
    });

    expect(latest.summary).toBeNull();
    expect(latest.summaryStatus).toBe('loading');

    await act(async () => {
      resolveRefresh({ total: 6, discontinued: 1 });
    });
    expect(latest.summaryStatus).toBe('ready');
    expect(latest.summary).toEqual({ total: 6, discontinued: 1 });
  });

  it('does not refresh a summary that was never fetched', async () => {
    fetchFavoriteCount.mockResolvedValue(5);
    await mount();

    await act(async () => {
      latest.refreshSummary();
    });

    expect(fetchFavoritesSummary).not.toHaveBeenCalled();
    expect(latest.summaryStatus).toBe('idle');
  });
});
