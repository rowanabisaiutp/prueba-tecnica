import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeed } from '@/hooks/useFeed';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useOfflineStore } from '@/store/offlineStore';
import { FeedList } from '@/components/FeedList';
import { Colors, Spacing, Typography } from '@/theme';

export function FeedScreen() {
  const { posts, status, hasNextPage, isFetching, isRefreshing, loadMore, refresh, retry } = useFeed();
  const { isConnected, wasOffline } = useNetworkStatus();
  const pendingCount = useOfflineStore(s => s.queue.length);

  useOfflineSync(isConnected);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark} />
          <Text style={styles.headerTitle}>Smart Feed</Text>
        </View>
        <View style={styles.headerRight}>
          {!isConnected ? (
            <View style={styles.offlinePill}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlinePillText}>Offline</Text>
            </View>
          ) : wasOffline && pendingCount === 0 ? (
            <View style={styles.syncPill}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
              <Text style={styles.syncPillText}>Synced</Text>
            </View>
          ) : null}
          <Ionicons name="notifications-outline" size={22} color={Colors.textSub} />
        </View>
      </View>

      {/* Offline banner */}
      {!isConnected && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Ionicons name="cloud-offline-outline" size={14} color={Colors.offline} />
          <Text style={styles.bannerText}>
            Offline mode
            {pendingCount > 0 ? `  ·  ${pendingCount} pending ${pendingCount === 1 ? 'action' : 'actions'}` : ''}
          </Text>
        </View>
      )}

      <FeedList
        posts={posts}
        status={status}
        hasNextPage={hasNextPage}
        isRefreshing={isRefreshing}
        isConnected={isConnected}
        onLoadMore={loadMore}
        onRefresh={refresh}
        onRetry={retry}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoMark: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.offline + '18',
    borderWidth: 1,
    borderColor: Colors.offline + '40',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.offline,
  },
  offlinePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.offline,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success + '35',
  },
  syncPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.offline + '15',
    borderBottomWidth: 1,
    borderBottomColor: Colors.offline + '30',
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.offline,
  },
});
