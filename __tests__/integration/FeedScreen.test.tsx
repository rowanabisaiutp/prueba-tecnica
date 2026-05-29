import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FeedScreen } from '@/screens/FeedScreen';

jest.mock('@/api/feedApi');
jest.mock('@/storage/mmkvStorage', () => ({
  savePosts: jest.fn(),
  loadPosts: jest.fn(() => []),
  clearPosts: jest.fn(),
}));
jest.mock('@/utils/imageCache', () => ({ preloadImages: jest.fn() }));
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));
jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  const ExpoImage = (props: object) => <Image {...props} />;
  ExpoImage.prefetch = jest.fn(() => Promise.resolve(true));
  ExpoImage.clearMemoryCache = jest.fn(() => Promise.resolve());
  ExpoImage.clearDiskCache = jest.fn(() => Promise.resolve());
  return { Image: ExpoImage };
});

import { fetchFeed } from '@/api/feedApi';
import { useFeedStore } from '@/store/feedStore';

const mockFetchFeed = fetchFeed as jest.MockedFunction<typeof fetchFeed>;

const makePosts = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    title: `Test Post ${i + 1}`,
    imageUrl: `https://picsum.photos/id/${i + 1}/600/400`,
    reactions: { like: i * 5, celebrate: 0, insightful: 0, support: 0 },
    userReaction: null,
    comments: 0,
    readTime: 3,
    createdAt: new Date().toISOString(),
    author: 'Test Author',
    category: 'Technology',
  }));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
);

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

describe('FeedScreen — integration', () => {
  it('muestra estado de carga inicialmente', async () => {
    mockFetchFeed.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ page: 1, posts: makePosts(10), hasNextPage: true }), 200)),
    );

    render(<FeedScreen />, { wrapper: Wrapper });

    expect(screen.getAllByTestId('skeleton-card').length || screen.queryByText('Smart Feed')).toBeTruthy();
  });

  it('muestra posts tras carga exitosa', async () => {
    mockFetchFeed.mockResolvedValueOnce({ page: 1, posts: makePosts(5), hasNextPage: true });

    render(<FeedScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeTruthy();
    });
  });

  it('muestra estado de error cuando la API falla', async () => {
    mockFetchFeed.mockRejectedValue(new Error('API failure'));

    render(<FeedScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Algo salió mal')).toBeTruthy();
    });
  });

  it('muestra botón reintentar en error y funciona', async () => {
    mockFetchFeed
      .mockRejectedValueOnce(new Error('API failure'))
      .mockResolvedValueOnce({ page: 1, posts: makePosts(3), hasNextPage: false });

    render(<FeedScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Reintentar'));
    });

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeTruthy();
    });
  });

  it('muestra el header con el título Smart Feed', async () => {
    mockFetchFeed.mockResolvedValueOnce({ page: 1, posts: [], hasNextPage: false });

    render(<FeedScreen />, { wrapper: Wrapper });

    expect(screen.getByText('Smart Feed')).toBeTruthy();
  });
});
