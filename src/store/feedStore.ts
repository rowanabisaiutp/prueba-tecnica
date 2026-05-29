import { create } from 'zustand';
import { Post, FeedStatus, ReactionType } from '@/types/post';
import { fetchFeed } from '@/api/feedApi';
import { savePosts, loadPosts, clearPosts } from '@/storage/mmkvStorage';
import { preloadImages, clearAllImageCache } from '@/utils/imageCache';

// Caché de referencia estable para evitar re-renders cuando el contenido no cambió
let cachedOrderedPosts: Post[] = [];
let cachedPostsById: Record<string, Post> = {};
let cachedPages: Record<number, string[]> = {};
let cachedCurrentPage = 0;

function computeOrderedPosts(
  postsById: Record<string, Post>,
  pages: Record<number, string[]>,
  currentPage: number,
): Post[] {
  // Retorna la misma referencia si nada cambió
  if (
    postsById === cachedPostsById &&
    pages === cachedPages &&
    currentPage === cachedCurrentPage
  ) {
    return cachedOrderedPosts;
  }
  const ids: string[] = [];
  for (let p = 1; p <= currentPage; p++) {
    if (pages[p]) ids.push(...pages[p]);
  }
  cachedOrderedPosts = ids.map(id => postsById[id]).filter(Boolean);
  cachedPostsById = postsById;
  cachedPages = pages;
  cachedCurrentPage = currentPage;
  return cachedOrderedPosts;
}

/**
 * Estado normalizado: postsById es O(1) para lookups y toggleLike.
 * pages guarda el orden por página para reconstruir el array de UI.
 * Escala correctamente a 10k+ posts sin iterar arrays completos.
 */
interface FeedState {
  postsById: Record<string, Post>;
  pages: Record<number, string[]>;
  currentPage: number;
  hasNextPage: boolean;
  status: FeedStatus;
  isFetching: boolean;
  isRefreshing: boolean;
  // Selector computado — devuelve posts en orden de inserción
  orderedPosts: () => Post[];
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  hydrateFromCache: () => void;
  addReaction: (postId: string, type: ReactionType) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  postsById: {},
  pages: {},
  currentPage: 0,
  hasNextPage: true,
  status: 'idle',
  isFetching: false,
  isRefreshing: false,

  orderedPosts: () => {
    const { postsById, pages, currentPage } = get();
    return computeOrderedPosts(postsById, pages, currentPage);
  },

  hydrateFromCache: () => {
    const cached = loadPosts();
    if (cached.length === 0) return;
    const postsById: Record<string, Post> = {};
    cached.forEach(p => { postsById[p.id] = p; });
    // Reconstruye un único "página 1" con todos los posts cacheados
    set({
      postsById,
      pages: { 1: cached.map(p => p.id) },
      currentPage: 1,
      status: 'idle',
    });
  },

  loadMore: async () => {
    const { isFetching, hasNextPage, currentPage } = get();
    if (isFetching || !hasNextPage) return;

    set({ isFetching: true, status: 'loading' });
    try {
      const nextPage = currentPage + 1;
      const response = await fetchFeed({ page: nextPage });

      const newPostsById = { ...get().postsById };
      response.posts.forEach(p => { newPostsById[p.id] = p; });

      const newPages = { ...get().pages, [nextPage]: response.posts.map(p => p.id) };

      // Persiste solo los posts que tenemos (eficiente: solo los nuevos se añaden)
      savePosts(Object.values(newPostsById));
      preloadImages(response.posts.map(p => p.imageUrl));

      set({
        postsById: newPostsById,
        pages: newPages,
        currentPage: nextPage,
        hasNextPage: response.hasNextPage,
        status: Object.keys(newPostsById).length === 0 ? 'empty' : 'idle',
        isFetching: false,
      });
    } catch (err) {
      // AbortError = petición cancelada intencionalmente, no es un error de red
      if (err instanceof Error && err.name === 'AbortError') {
        set({ isFetching: false });
        return;
      }
      set({ status: 'error', isFetching: false });
    }
  },

  refresh: async () => {
    const { isFetching } = get();
    if (isFetching) return;

    set({ isRefreshing: true, isFetching: true, status: 'loading', currentPage: 0, hasNextPage: true });
    clearPosts();
    clearAllImageCache(); // el usuario pide contenido fresco — descarta caché de disco
    try {
      const response = await fetchFeed({ page: 1 });

      const postsById: Record<string, Post> = {};
      response.posts.forEach(p => { postsById[p.id] = p; });

      savePosts(response.posts);
      preloadImages(response.posts.map(p => p.imageUrl));

      set({
        postsById,
        pages: { 1: response.posts.map(p => p.id) },
        currentPage: 1,
        hasNextPage: response.hasNextPage,
        status: response.posts.length === 0 ? 'empty' : 'idle',
        isFetching: false,
        isRefreshing: false,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        set({ isFetching: false, isRefreshing: false });
        return;
      }
      set({ status: 'error', isFetching: false, isRefreshing: false });
    }
  },

  retry: async () => {
    set({ status: 'loading', isFetching: false });
    await get().loadMore();
  },

  // O(1) — toggle de reacción por ID sin iterar el array
  addReaction: (postId: string, type: ReactionType) => {
    const post = get().postsById[postId];
    if (!post) return;
    const prev = post.userReaction;
    const reactions = { ...post.reactions };
    if (prev) reactions[prev] = Math.max(0, reactions[prev] - 1);
    if (prev !== type) reactions[type] = reactions[type] + 1;
    set(state => ({
      postsById: {
        ...state.postsById,
        [postId]: { ...post, reactions, userReaction: prev === type ? null : type },
      },
    }));
  },
}));

// Selector estable para componentes — evita re-renders innecesarios
export const selectOrderedPosts = (s: FeedState) => s.orderedPosts();
