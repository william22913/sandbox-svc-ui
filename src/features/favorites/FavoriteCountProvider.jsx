import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchFavoriteCount, fetchFavoritesSummary } from '../../core/services/favoriteService';

const NOOP_CONTEXT = {
  count: null,
  summary: null,
  summaryStatus: 'idle',
  refresh: () => {},
  ensureSummary: () => {},
  refreshSummary: () => {},
};

const FavoriteCountContext = createContext(NOOP_CONTEXT);

/** FEAT-004 badge text: 1-99 exact, `99+` at 100 or more, `null` hides it. */
export function formatBadgeCount(count) {
  if (!Number.isInteger(count) || count <= 0) return null;
  return count >= 100 ? '99+' : String(count);
}

/** FEAT-005 tooltip text: the literal spec template, exact integers, no i18n. */
export function formatFavoriteSummary({ total, discontinued }) {
  return `${total} favorites (${discontinued} discontinued)`;
}

/**
 * FEAT-004 count + FEAT-005 summary state for the shell badge. The count is
 * fetched once on mount; the summary is fetched on first hover only and is
 * invalidated after a successful favorite/un-favorite (REQ-007, REQ-018).
 */
export default function FavoriteCountProvider({ children }) {
  const [count, setCount] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState('idle');
  const summaryRequest = useRef(0);

  const refresh = useCallback(async () => {
    try {
      setCount(await fetchFavoriteCount());
    } catch {
      setCount(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadSummary = useCallback(async () => {
    const requestId = ++summaryRequest.current;
    setSummary(null);
    setSummaryStatus('loading');
    try {
      const next = await fetchFavoritesSummary();
      if (requestId !== summaryRequest.current) return;
      if (next === null) {
        setSummaryStatus('error');
        return;
      }
      setSummary(next);
      setSummaryStatus('ready');
    } catch {
      if (requestId !== summaryRequest.current) return;
      setSummaryStatus('error');
    }
  }, []);

  // First hover fetches; a repeat hover while ready does not (REQ-007).
  const ensureSummary = useCallback(() => {
    if (summaryStatus === 'loading' || summaryStatus === 'ready') return;
    loadSummary();
  }, [summaryStatus, loadSummary]);

  // Post-action path: a never-fetched summary stays first-hover-driven, a
  // fetched one is dropped before refetching so old values cannot be shown.
  const refreshSummary = useCallback(() => {
    if (summaryStatus === 'idle') return;
    loadSummary();
  }, [summaryStatus, loadSummary]);

  const value = useMemo(
    () => ({ count, summary, summaryStatus, refresh, ensureSummary, refreshSummary }),
    [count, summary, summaryStatus, refresh, ensureSummary, refreshSummary]
  );

  return (
    <FavoriteCountContext.Provider value={value}>{children}</FavoriteCountContext.Provider>
  );
}

export function useFavoriteCount() {
  return useContext(FavoriteCountContext);
}
