import { MMKV } from 'react-native-mmkv';
import { ReactionAction } from '@/types/post';

const storage = new MMKV({ id: 'feed-storage' });
const QUEUE_KEY = 'offline_queue';

export function enqueue(action: ReactionAction): void {
  const current = peek();
  storage.set(QUEUE_KEY, JSON.stringify([...current, action]));
}

export function dequeue(): ReactionAction[] {
  const actions = peek();
  storage.delete(QUEUE_KEY);
  return actions;
}

export function peek(): ReactionAction[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReactionAction[];
  } catch {
    return [];
  }
}
