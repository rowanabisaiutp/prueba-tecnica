import { useOfflineStore } from '@/store/offlineStore';
import { useFeedStore } from '@/store/feedStore';
import { LikeAction } from '@/types/post';
import { exponentialBackoff } from '@/utils/backoff';

async function simulateLikeApi(_action: LikeAction): Promise<void> {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
  if (Math.random() < 0.05) throw new Error('Sync failed');
}

export async function syncOfflineQueue(): Promise<void> {
  const { flush, enqueue } = useOfflineStore.getState();
  const actions = flush();

  if (actions.length === 0) return;

  const failed: LikeAction[] = [];

  for (const action of actions) {
    try {
      // Usa backoff exponencial: base 1s, máximo 30s, 3 intentos
      await exponentialBackoff(
        () => simulateLikeApi(action),
        3,
        1000,
        30000,
      );
    } catch {
      failed.push(action);
    }
  }

  failed.forEach(a => enqueue(a));

  if (failed.length === 0) {
    await useFeedStore.getState().refresh();
  }
}
