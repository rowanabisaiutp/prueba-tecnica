import { create } from 'zustand';
import { ReactionAction } from '@/types/post';
import { enqueue as persistEnqueue, dequeue as persistDequeue, peek } from '@/storage/offlineQueue';

interface OfflineState {
  queue: ReactionAction[];
  enqueue: (action: ReactionAction) => void;
  flush: () => ReactionAction[];
  clear: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  queue: peek(),

  enqueue: (action) => {
    persistEnqueue(action);
    set(state => ({ queue: [...state.queue, action] }));
  },

  flush: () => {
    const actions = persistDequeue();
    set({ queue: [] });
    return actions;
  },

  clear: () => {
    persistDequeue();
    set({ queue: [] });
  },
}));
