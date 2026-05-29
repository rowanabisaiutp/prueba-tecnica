import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FeedStatus } from '@/types/post';

interface FooterLoaderProps {
  status: FeedStatus;
  hasNextPage: boolean;
  onRetry: () => void;
}

export const FooterLoader = React.memo(({ status, hasNextPage, onRetry }: FooterLoaderProps) => {
  if (!hasNextPage) {
    return (
      <View style={styles.container}>
        <Text style={styles.endText}>— Fin del feed —</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar más contenido</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar carga">
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#7C5CFC" />
      </View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  endText: {
    color: '#666',
    fontSize: 13,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#7C5CFC',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
