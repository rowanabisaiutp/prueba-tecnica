import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFeedStore, selectOrderedPosts } from '@/store/feedStore';
import { clearMemoryCache } from '@/utils/imageCache';
import { cancelAllFeedRequests } from '@/api/feedApi';

export function useFeed() {
  const posts = useFeedStore(selectOrderedPosts);
  const status = useFeedStore(s => s.status);
  const hasNextPage = useFeedStore(s => s.hasNextPage);
  const isFetching = useFeedStore(s => s.isFetching);
  const isRefreshing = useFeedStore(s => s.isRefreshing);
  const loadMore = useFeedStore(s => s.loadMore);
  const refresh = useFeedStore(s => s.refresh);
  const retry = useFeedStore(s => s.retry);
  const hydrateFromCache = useFeedStore(s => s.hydrateFromCache);

  useEffect(() => {
    hydrateFromCache();
    loadMore();
    return () => cancelAllFeedRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Libera caché de imágenes en memoria cuando la app va a background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        // Solo libera RAM — el disco se preserva para visualización offline
        clearMemoryCache();
      }
    });
    return () => sub.remove();
  }, []);

  return { posts, status, hasNextPage, isFetching, isRefreshing, loadMore, refresh, retry };
}
