import { useState, useEffect, useCallback, useRef } from 'react';

export function usePaginatedList(fetcher, pageSize = 20) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const skipRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reset = useCallback(async () => {
    skipRef.current = 0;
    setItems([]);
    setLoading(true);
    try {
      const batch = await fetcherRef.current(0, pageSize);
      setItems(batch);
      setHasMore(batch.length === pageSize);
      skipRef.current = batch.length;
    } catch (e) {
      console.error('paginated list error', e);
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const batch = await fetcherRef.current(skipRef.current, pageSize);
      setItems((prev) => [...prev, ...batch]);
      setHasMore(batch.length === pageSize);
      skipRef.current += batch.length;
    } catch (e) {
      console.error('load more error', e);
    } finally {
      setLoadingMore(false);
    }
  }, [pageSize]);

  useEffect(() => {
    reset();
  }, [reset]);

  return { items, loading, loadingMore, hasMore, loadMore, refresh: reset };
}