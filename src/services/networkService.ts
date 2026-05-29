import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type ReconnectCallback = () => void;

const callbacks: ReconnectCallback[] = [];
let wasConnected: boolean | null = null;

export function onReconnect(cb: ReconnectCallback): () => void {
  callbacks.push(cb);
  return () => {
    const idx = callbacks.indexOf(cb);
    if (idx !== -1) callbacks.splice(idx, 1);
  };
}

NetInfo.addEventListener((state: NetInfoState) => {
  const isConnected = state.isConnected ?? false;
  if (wasConnected === false && isConnected) {
    callbacks.forEach(cb => cb());
  }
  wasConnected = isConnected;
});
