import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFavorites, removeFavorite } from '../../../core/services/favoriteService';
import { isUnauthorized } from '../../../helpers/redirectToLogin';

export default function useFavorites({ initialPage = 1, initialPageSize = 20 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(async (targetPage, targetSize, { silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetchFavorites({ page: targetPage, pageSize: targetSize });
      if (id !== requestId.current) return;
      setItems(result.items);
      setTotal(result.total);
      if (result.page !== targetPage) setPage(result.page);
      if (result.pageSize !== targetSize) setPageSize(result.pageSize);
    } catch (err) {
      if (id !== requestId.current || isUnauthorized(err)) return;
      if (!silent) setError('loadError');
    } finally {
      if (id === requestId.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, pageSize);
  }, [page, pageSize, load]);

  const changePage = useCallback((nextPage) => {
    setActionError(null);
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((_current, nextSize) => {
    setActionError(null);
    setPage(1);
    setPageSize(nextSize);
  }, []);

  const retry = useCallback(() => {
    load(page, pageSize);
  }, [load, page, pageSize]);

  const remove = useCallback(
    async (itemId) => {
      setActionError(null);
      const previousItems = items;
      const previousTotal = total;
      const nextItems = items.filter((row) => row.item_id !== itemId);
      const nextTotal = Math.max(0, total - 1);

      setItems(nextItems);
      setTotal(nextTotal);

      try {
        await removeFavorite(itemId);
        if (nextItems.length === 0 && nextTotal > 0 && page > 1) {
          setPage((current) => current - 1);
        } else if (nextTotal > 0) {
          // Reconcile with the server so the last row of the next page slides in.
          load(page, pageSize, { silent: true });
        }
      } catch (err) {
        if (isUnauthorized(err)) return;
        setItems(previousItems);
        setTotal(previousTotal);
        setActionError('removeError');
      }
    },
    [items, total, page, pageSize, load]
  );

  return {
    page,
    pageSize,
    items,
    total,
    loading,
    error,
    actionError,
    changePage,
    changePageSize,
    retry,
    remove,
  };
}
