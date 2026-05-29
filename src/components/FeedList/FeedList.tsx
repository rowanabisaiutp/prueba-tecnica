import React, { useCallback, useRef } from 'react';
import {
  RefreshControl, View, StyleSheet,
  useWindowDimensions, ActivityIndicator,
  Text, Pressable,
} from 'react-native';
import { MasonryFlashList } from '@shopify/flash-list';
import { Post, FeedStatus } from '@/types/post';
import { PostCard } from '@/components/PostCard';
import { SkeletonCard } from '@/components/LoadingStates';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { preloadImages } from '@/utils/imageCache';

const NUM_COLUMNS = 2;
const ESTIMATED_ITEM_SIZE = 340;

interface FeedListProps {
  posts: Post[];
  status: FeedStatus;
  hasNextPage: boolean;
  isRefreshing: boolean;
  isConnected: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onRetry: () => void;
}

export const FeedList = React.memo(({
  posts, status, hasNextPage, isRefreshing,
  isConnected, onLoadMore, onRefresh, onRetry,
}: FeedListProps) => {
  const { width } = useWindowDimensions();
  const loadingRef = useRef(false);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard post={item} isConnected={isConnected} />
    ),
    [isConnected],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (loadingRef.current || !hasNextPage) return;
    loadingRef.current = true;
    onLoadMore();
    setTimeout(() => { loadingRef.current = false; }, 1000);
  }, [hasNextPage, onLoadMore]);

  const handleViewable = useCallback(({ viewableItems }: any) => {
    const lastVisible = viewableItems[viewableItems.length - 1];
    if (!lastVisible) return;
    const idx = lastVisible.index ?? 0;
    const nextUrls = posts.slice(idx + 4, idx + 10).map(p => p.imageUrl);
    if (nextUrls.length > 0) preloadImages(nextUrls);
  }, [posts]);

  const renderFooter = useCallback(() => {
    if (!hasNextPage) {
      return (
        <View style={styles.endRow}>
          <View style={styles.endLine} />
          <Text style={styles.endText}>End of feed</Text>
          <View style={styles.endLine} />
        </View>
      );
    }
    if (status === 'error' && posts.length > 0) {
      return (
        <View style={styles.footerError}>
          <Text style={styles.footerErrorText}>Failed to load more</Text>
          <Pressable style={styles.retryBtn} onPress={onRetry} accessibilityRole="button">
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (status === 'loading' && posts.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }
    return null;
  }, [hasNextPage, status, posts.length, onRetry]);

  // Loading skeleton — grid de skeletons
  if (status === 'loading' && posts.length === 0 && !isRefreshing) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.skeletonCell, { width: (width - Spacing.lg * 2) / NUM_COLUMNS }]}>
            <SkeletonCard />
          </View>
        ))}
      </View>
    );
  }

  // Error sin posts
  if (status === 'error' && posts.length === 0) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.stateTitle}>Something went wrong</Text>
        <Text style={styles.stateSub}>Could not load the feed</Text>
        <Pressable style={styles.retryBtnLarge} onPress={onRetry} accessibilityRole="button">
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.retryTextLarge}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  // Vacío
  if (status === 'empty' && posts.length === 0) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="newspaper-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.stateTitle}>No posts yet</Text>
        <Text style={styles.stateSub}>Check back later</Text>
      </View>
    );
  }

  return (
    <MasonryFlashList
      data={posts}
      numColumns={NUM_COLUMNS}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={ESTIMATED_ITEM_SIZE}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      onViewableItemsChanged={handleViewable}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  skeletonCell: {
    paddingHorizontal: Spacing.xs,
  },
  footerLoader: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  footerError: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerErrorText: {
    ...Typography.body,
    color: Colors.textSub,
  },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  retryText: {
    ...Typography.label,
    color: '#fff',
  },
  endRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  endText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: Spacing.sm,
  },
  stateTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  stateSub: {
    ...Typography.body,
    color: Colors.textSub,
  },
  retryBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginTop: Spacing.md,
  },
  retryTextLarge: {
    ...Typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});
