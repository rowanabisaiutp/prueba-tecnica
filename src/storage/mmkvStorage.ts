import { MMKV } from 'react-native-mmkv';
import { Post } from '@/types/post';

const storage = new MMKV({ id: 'feed-storage' });
const POSTS_KEY = 'cached_posts';

export function savePosts(posts: Post[]): void {
  storage.set(POSTS_KEY, JSON.stringify(posts));
}

const DEFAULT_REACTIONS = { like: 0, celebrate: 0, insightful: 0, support: 0 };

export function loadPosts(): Post[] {
  const raw = storage.getString(POSTS_KEY);
  if (!raw) return [];
  try {
    const posts = JSON.parse(raw) as Post[];
    // Migración: posts cacheados con formato antiguo (likes en vez de reactions)
    return posts.map(p => ({
      ...p,
      reactions: p.reactions ?? { ...DEFAULT_REACTIONS, like: (p as any).likes ?? 0 },
      userReaction: p.userReaction ?? null,
      comments: p.comments ?? 0,
      readTime: p.readTime ?? 3,
    }));
  } catch {
    storage.delete(POSTS_KEY); // cache corrupta — la limpia
    return [];
  }
}

export function clearPosts(): void {
  storage.delete(POSTS_KEY);
}
