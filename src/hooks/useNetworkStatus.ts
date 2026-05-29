import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Chequeo real del estado inicial — evita asumir "conectado" si la app arranca offline
    NetInfo.fetch().then(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) setWasOffline(true);
    });

    return NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) setWasOffline(true);
    });
  }, []);

  return { isConnected, wasOffline };
}
