import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeedStore, selectOrderedPosts } from '@/store/feedStore';
import { PostCard } from '@/components/PostCard';
import { Colors, Spacing, Typography, Radius } from '@/theme';

export function LikesScreen() {
  const posts = useFeedStore(selectOrderedPosts);
  const likedPosts = useMemo(
    () => posts.filter(p => p.userReaction !== null),
    [posts],
  );

  const REACTION_COLORS = {
    like: Colors.like,
    celebrate: Colors.celebrate,
    insightful: Colors.insightful,
    support: Colors.support,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoMark, { backgroundColor: Colors.like }]} />
          <Text style={styles.headerTitle}>My Reactions</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{likedPosts.length}</Text>
        </View>
      </View>

      {likedPosts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No reactions yet</Text>
          <Text style={styles.emptySub}>Posts you react to will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={likedPosts}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              {item.userReaction && (
                <View style={[styles.reactionTag, { backgroundColor: REACTION_COLORS[item.userReaction] + '20', borderColor: REACTION_COLORS[item.userReaction] + '50' }]}>
                  <Ionicons
                    name={item.userReaction === 'like' ? 'heart' : item.userReaction === 'celebrate' ? 'flash' : item.userReaction === 'insightful' ? 'bulb' : 'thumbs-up'}
                    size={11}
                    color={REACTION_COLORS[item.userReaction]}
                  />
                  <Text style={[styles.reactionTagText, { color: REACTION_COLORS[item.userReaction] }]}>
                    {item.userReaction.charAt(0).toUpperCase() + item.userReaction.slice(1)}
                  </Text>
                </View>
              )}
              <PostCard post={item} isConnected={true} />
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoMark: { width: 8, height: 8, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.like + '15',
    borderWidth: 1,
    borderColor: Colors.like + '40',
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.like },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: 80,
  },
  emptyTitle: { ...Typography.h2, color: Colors.text, marginTop: Spacing.md },
  emptySub: { ...Typography.body, color: Colors.textSub, textAlign: 'center', paddingHorizontal: Spacing.xxl },
  list: { padding: Spacing.sm, paddingBottom: Spacing.xxl },
  row: { justifyContent: 'flex-start' },
  cardWrap: { flex: 1 },
  reactionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginHorizontal: Spacing.xs,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  reactionTagText: { fontSize: 10, fontWeight: '700' },
});
