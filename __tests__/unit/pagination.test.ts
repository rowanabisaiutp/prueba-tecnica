import { act } from '@testing-library/react-native';

jest.mock('@/api/feedApi');
jest.mock('@/storage/mmkvStorage', () => ({
  savePosts: jest.fn(),
  loadPosts: jest.fn(() => []),
  clearPosts: jest.fn(),
}));
jest.mock('@/utils/imageCache', () => ({
  preloadImages: jest.fn(),
  clearImageCache: jest.fn(),
}));

import { fetchFeed } from '@/api/feedApi';
import { useFeedStore } from '@/store/feedStore';

const mockFetchFeed = fetchFeed as jest.MockedFunction<typeof fetchFeed>;

const makePosts = (startId: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: String(startId + i),
    title: `Post ${startId + i}`,
    imageUrl: `https://picsum.photos/id/${startId + i}/600/400`,
    reactions: { like: i * 10, celebrate: 0, insightful: 0, support: 0 },
    userReaction: null,
    comments: 0,
    readTime: 3,
    createdAt: new Date().toISOString(),
    author: 'Test Author',
    category: 'Technology',
  }));

const MOCK_PAGE_1 = { page: 1, posts: makePosts(1, 10), hasNextPage: true };
const MOCK_PAGE_2 = { page: 2, posts: makePosts(11, 10), hasNextPage: false };

beforeEach(() => {
  useFeedStore.setState({
    postsById: {},
    pages: {},
    currentPage: 0,
    hasNextPage: true,
    status: 'idle',
    isFetching: false,
    isRefreshing: false,
  });
  jest.clearAllMocks();
});

describe('feedStore — paginación normalizada', () => {
  it('carga la primera página correctamente', async () => {
    mockFetchFeed.mockResolvedValueOnce(MOCK_PAGE_1);

    await act(async () => { await useFeedStore.getState().loadMore(); });

    const state = useFeedStore.getState();
    expect(state.orderedPosts()).toHaveLength(10);
    expect(state.currentPage).toBe(1);
    expect(state.hasNextPage).toBe(true);
    expect(state.status).toBe('idle');
    expect(state.isFetching).toBe(false);
  });

  it('no hace segunda petición si isFetching === true (control de concurrencia)', async () => {
    mockFetchFeed.mockResolvedValue(MOCK_PAGE_1);
    useFeedStore.setState({ isFetching: true });

    await act(async () => { await useFeedStore.getState().loadMore(); });

    expect(mockFetchFeed).not.toHaveBeenCalled();
  });

  it('acumula posts de páginas distintas con IDs únicos (estado normalizado)', async () => {
    mockFetchFeed
      .mockResolvedValueOnce(MOCK_PAGE_1)
      .mockResolvedValueOnce(MOCK_PAGE_2);

    await act(async () => { await useFeedStore.getState().loadMore(); });
    await act(async () => { await useFeedStore.getState().loadMore(); });

    const state = useFeedStore.getState();
    expect(state.orderedPosts()).toHaveLength(20);
    expect(state.currentPage).toBe(2);
    expect(state.hasNextPage).toBe(false);
    // Verifica que no hay IDs duplicados en postsById
    expect(Object.keys(state.postsById)).toHaveLength(20);
  });

  it('no carga más si hasNextPage === false', async () => {
    useFeedStore.setState({ hasNextPage: false });

    await act(async () => { await useFeedStore.getState().loadMore(); });

    expect(mockFetchFeed).not.toHaveBeenCalled();
  });

  it('pone status=error cuando la API falla', async () => {
    mockFetchFeed.mockRejectedValueOnce(new Error('API error'));

    await act(async () => { await useFeedStore.getState().loadMore(); });

    const state = useFeedStore.getState();
    expect(state.status).toBe('error');
    expect(state.isFetching).toBe(false);
  });

  it('retry vuelve a intentar la carga tras error', async () => {
    mockFetchFeed
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce(MOCK_PAGE_1);

    await act(async () => { await useFeedStore.getState().loadMore(); });
    expect(useFeedStore.getState().status).toBe('error');

    await act(async () => { await useFeedStore.getState().retry(); });

    expect(useFeedStore.getState().status).toBe('idle');
    expect(useFeedStore.getState().orderedPosts()).toHaveLength(10);
  });

  it('refresh reinicia el estado normalizado y recarga desde página 1', async () => {
    // Simula estado con posts cargados
    const postsById: Record<string, any> = {};
    MOCK_PAGE_1.posts.forEach(p => { postsById[p.id] = p; });
    useFeedStore.setState({ postsById, pages: { 1: MOCK_PAGE_1.posts.map(p => p.id) }, currentPage: 3 });

    mockFetchFeed.mockResolvedValueOnce(MOCK_PAGE_1);

    await act(async () => { await useFeedStore.getState().refresh(); });

    const state = useFeedStore.getState();
    expect(state.currentPage).toBe(1);
    expect(state.orderedPosts()).toHaveLength(10);
    expect(mockFetchFeed).toHaveBeenCalledWith({ page: 1 });
    expect(state.isRefreshing).toBe(false);
  });

  it('addReaction actualiza en O(1) por ID sin iterar el array', () => {
    const postsById: Record<string, any> = {};
    MOCK_PAGE_1.posts.forEach(p => { postsById[p.id] = p; });
    useFeedStore.setState({ postsById, pages: { 1: MOCK_PAGE_1.posts.map(p => p.id) }, currentPage: 1 });

    const originalLikes = MOCK_PAGE_1.posts[0].reactions.like;

    act(() => { useFeedStore.getState().addReaction('1', 'like'); });

    expect(useFeedStore.getState().postsById['1'].reactions.like).toBe(originalLikes + 1);
    expect(useFeedStore.getState().postsById['1'].userReaction).toBe('like');
    // Toggle: reaccionar de nuevo quita la reacción
    act(() => { useFeedStore.getState().addReaction('1', 'like'); });
    expect(useFeedStore.getState().postsById['1'].userReaction).toBeNull();
  });
});
