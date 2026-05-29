import { useEffect, useRef } from 'react';
import { syncOfflineQueue } from '@/services/syncService';

export function useOfflineSync(isConnected: boolean): void {
  const prevConnected = useRef<boolean>(isConnected);

  useEffect(() => {
    if (!prevConnected.current && isConnected) {
      syncOfflineQueue().catch(console.error);
    }
    prevConnected.current = isConnected;
  }, [isConnected]);
}
