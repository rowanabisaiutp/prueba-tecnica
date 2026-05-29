import { FeedResponse, PaginationParams } from '@/types/api';
import { Post, Reactions } from '@/types/post';

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const PAGE_SIZE = 10;
const TOTAL_PAGES = 10; // JSONPlaceholder tiene exactamente 100 posts (10 páginas)

const AUTHORS = [
  'Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown',
  'Emma Davis', 'Frank Miller', 'Grace Lee', 'Henry Wilson',
  'Iris Chen', 'James Rivera',
];

const CATEGORIES = [
  'Technology', 'Design', 'Science', 'Engineering',
  'Product', 'Data', 'Security', 'Mobile', 'Business', 'Research',
];

// Registro de controladores activos — permite cancelar peticiones en vuelo
const activeControllers = new Map<number, AbortController>();

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      const abortErr = new Error('Aborted');
      abortErr.name = 'AbortError';
      reject(abortErr);
    });
  });
}

interface JSONPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

function mapToPost(raw: JSONPlaceholderPost): Post {
  const seed = raw.id;
  const reactions: Reactions = {
    like:        Math.floor(((seed * 17 + 42) % 400) + 10),
    celebrate:   Math.floor((seed * 7  + 13) % 120),
    insightful:  Math.floor((seed * 11 + 5)  % 200),
    support:     Math.floor((seed * 3  + 22) % 80),
  };
  return {
    id:          String(raw.id),
    title:       raw.title.charAt(0).toUpperCase() + raw.title.slice(1),
    imageUrl:    `https://picsum.photos/id/${(seed % 85) + 10}/600/400`,
    reactions,
    userReaction: null,
    comments:    Math.floor(((seed * 9 + 7) % 60)),
    readTime:    Math.floor((seed % 7) + 2),
    createdAt:   new Date(Date.now() - seed * 86400000).toISOString(),
    author:      AUTHORS[(raw.userId - 1) % AUTHORS.length],
    category:    CATEGORIES[seed % CATEGORIES.length],
  };
}

export async function fetchFeed({
  page,
  limit = PAGE_SIZE,
}: PaginationParams): Promise<FeedResponse> {
  // Cancela petición anterior para la misma página (evita race conditions)
  activeControllers.get(page)?.abort();

  const controller = new AbortController();
  activeControllers.set(page, controller);

  try {
    // Latencia artificial ≥ 500ms requerida por la prueba técnica
    await delay(500 + Math.random() * 300, controller.signal);

    // 10% de errores aleatorios requeridos por la prueba técnica
    if (Math.random() < 0.1) {
      throw new Error('Server error: random failure (10% rate)');
    }

    const response = await fetch(
      `${BASE_URL}/posts?_page=${page}&_limit=${limit}`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const raw: JSONPlaceholderPost[] = await response.json();
    const posts = raw.map(mapToPost);

    return {
      page,
      posts,
      hasNextPage: page < TOTAL_PAGES,
    };
  } finally {
    activeControllers.delete(page);
  }
}

export function cancelFeedRequest(page: number): void {
  activeControllers.get(page)?.abort();
  activeControllers.delete(page);
}

export function cancelAllFeedRequests(): void {
  activeControllers.forEach(ctrl => ctrl.abort());
  activeControllers.clear();
}
