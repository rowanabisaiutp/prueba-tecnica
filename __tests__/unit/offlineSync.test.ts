import { enqueue, dequeue, peek } from '@/storage/offlineQueue';
import { useOfflineStore } from '@/store/offlineStore';
import { LikeAction } from '@/types/post';

jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: string) => { store[key] = value; },
      getString: (key: string) => store[key],
      delete: (key: string) => { delete store[key]; },
    })),
  };
});

const makeAction = (postId: string): LikeAction => ({
  postId,
  reactionType: 'like',
  timestamp: Date.now(),
});

beforeEach(() => {
  dequeue();
  useOfflineStore.setState({ queue: [] });
});

describe('offlineQueue — storage layer', () => {
  it('enqueue + peek no consume la cola', () => {
    enqueue(makeAction('1'));
    enqueue(makeAction('2'));

    const peeked = peek();
    expect(peeked).toHaveLength(2);
    expect(peek()).toHaveLength(2);
  });

  it('dequeue vacía la cola y retorna los elementos', () => {
    enqueue(makeAction('1'));
    enqueue(makeAction('2'));

    const items = dequeue();
    expect(items).toHaveLength(2);
    expect(peek()).toHaveLength(0);
  });

  it('dequeue en cola vacía retorna array vacío', () => {
    expect(dequeue()).toEqual([]);
  });
});

describe('useOfflineStore — Zustand', () => {
  it('enqueue agrega acción al estado y al storage', () => {
    const action = makeAction('post-1');
    useOfflineStore.getState().enqueue(action);

    expect(useOfflineStore.getState().queue).toHaveLength(1);
    expect(useOfflineStore.getState().queue[0].postId).toBe('post-1');
  });

  it('flush vacía el estado y retorna las acciones', () => {
    useOfflineStore.getState().enqueue(makeAction('a'));
    useOfflineStore.getState().enqueue(makeAction('b'));

    const flushed = useOfflineStore.getState().flush();
    expect(flushed).toHaveLength(2);
    expect(useOfflineStore.getState().queue).toHaveLength(0);
  });

  it('clear elimina todo sin retornar nada', () => {
    useOfflineStore.getState().enqueue(makeAction('x'));
    useOfflineStore.getState().clear();
    expect(useOfflineStore.getState().queue).toHaveLength(0);
  });
});
