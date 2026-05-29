import { MMKV } from 'react-native-mmkv';
import { Post } from '@/types/post';

const storage = new MMKV({ id: 'feed-storage' });
const KEY = 'bookmarks';

export function saveBookmark(post: Post): void {
  const list = getBookmarks();
  if (list.some(p => p.id === post.id)) return;
  storage.set(KEY, JSON.stringify([...list, post]));
}

export function removeBookmark(postId: string): void {
  const list = getBookmarks().filter(p => p.id !== postId);
  storage.set(KEY, JSON.stringify(list));
}

export function getBookmarks(): Post[] {
  const raw = storage.getString(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Post[]; } catch { return []; }
}
