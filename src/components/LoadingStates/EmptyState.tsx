import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FeedStatus } from '@/types/post';

interface EmptyStateProps {
  status: FeedStatus;
  onRetry: () => void;
}

export const EmptyState = React.memo(({ status, onRetry }: EmptyStateProps) => {
  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.subtitle}>No pudimos cargar el feed</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga del feed"
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'empty') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>📭</Text>
        <Text style={styles.title}>Sin contenido</Text>
        <Text style={styles.subtitle}>No hay posts disponibles</Text>
      </View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 8,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#7C5CFC',
    borderRadius: 24,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
