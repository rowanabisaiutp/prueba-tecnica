import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, Share, Alert, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFeedStore } from '@/store/feedStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { timeAgo } from '@/utils/timeAgo';
import { getAverageColor } from '@/utils/colorExtractor';
import { ReactionPicker } from '@/components/PostCard/ReactionPicker';
import { ReactionType } from '@/types/post';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type RoutePropType = RouteProp<RootStackParamList, 'PostDetail'>;

const REACTION_CONFIG: { type: ReactionType; icon: string; label: string; color: string }[] = [
  { type: 'like',       icon: 'heart',     label: 'Like',      color: Colors.like },
  { type: 'celebrate',  icon: 'flash',     label: 'Celebrate', color: Colors.celebrate },
  { type: 'insightful', icon: 'bulb',      label: 'Insightful',color: Colors.insightful },
  { type: 'support',    icon: 'thumbs-up', label: 'Support',   color: Colors.support },
];

const CATEGORY_COLORS = Colors.categoryColors;

export function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { postId } = route.params;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const post = useFeedStore(s => s.postsById[postId]);
  const addReaction = useFeedStore(s => s.addReaction);
  const { isBookmarked, toggle } = useBookmarkStore();
  const enqueue = useOfflineStore(s => s.enqueue);
  const { isConnected } = useNetworkStatus();
  const [showPicker, setShowPicker] = React.useState(false);

  const saved = isBookmarked(postId);
  const accentColor = post ? CATEGORY_COLORS[post.category.length % CATEGORY_COLORS.length] : Colors.primary;
  const bgColor = post ? getAverageColor(post.imageUrl) : Colors.surface;
  const imageHeight = Math.round(width * 0.6);
  const initials = post?.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '';

  const handleReaction = useCallback((type: ReactionType) => {
    if (!post) return;
    addReaction(post.id, type);
    if (!isConnected) enqueue({ postId: post.id, reactionType: type, timestamp: Date.now() });
  }, [post, addReaction, isConnected, enqueue]);

  const handleShare = useCallback(async () => {
    if (!post) return;
    try {
      await Share.share({ title: post.title, message: `${post.title}\n\nShared from Smart Feed`, url: post.imageUrl });
    } catch {
      Alert.alert('Unable to share', 'Please try again.');
    }
  }, [post]);

  const handleSave = useCallback(() => {
    if (!post) return;
    toggle(post);
  }, [post, toggle]);

  if (!post) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.notFound}>Post not found</Text>
      </View>
    );
  }

  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* Hero image */}
        <View style={{ height: imageHeight }}>
          <Image
            source={{ uri: post.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="disk"
          />
          {/* Gradient overlay */}
          <View style={styles.imageOverlay} />

          {/* Back button */}
          <Pressable
            style={[styles.backBtn, { top: insets.top + Spacing.sm }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>

          {/* Category badge on image */}
          <View style={[styles.heroBadge, { backgroundColor: accentColor + 'CC' }]}>
            <Text style={styles.heroBadgeText}>{post.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: accentColor + '25', borderColor: accentColor + '50' }]}>
              <Text style={[styles.avatarText, { color: accentColor }]}>{initials}</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.metaText}>{timeAgo(post.createdAt)}</Text>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="book-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.metaText}>{post.readTime} min read</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.divider} />

          {/* Reactions breakdown */}
          <Text style={styles.sectionLabel}>REACTIONS  ·  {totalReactions}</Text>
          <View style={styles.reactionsGrid}>
            {REACTION_CONFIG.map(r => {
              const count = post.reactions[r.type];
              const active = post.userReaction === r.type;
              return (
                <Pressable
                  key={r.type}
                  style={[styles.reactionPill, active && { borderColor: r.color, backgroundColor: r.color + '15' }]}
                  onPress={() => handleReaction(r.type)}
                  onLongPress={() => setShowPicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.label}: ${count}`}
                >
                  <Ionicons
                    name={active ? r.icon as any : `${r.icon}-outline` as any}
                    size={16}
                    color={active ? r.color : Colors.textSub}
                  />
                  <Text style={[styles.reactionCount, active && { color: r.color }]}>{count}</Text>
                  <Text style={[styles.reactionLabel, active && { color: r.color }]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Comments placeholder */}
          <View style={styles.commentsRow}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.textSub} />
            <Text style={styles.commentsText}>{post.comments} comments</Text>
          </View>

          <View style={styles.divider} />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share">
              <Ionicons name="share-social-outline" size={20} color={Colors.text} />
              <Text style={styles.actionLabel}>Share</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, saved && styles.actionBtnActive]}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove bookmark' : 'Save post'}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={saved ? Colors.primary : Colors.text}
              />
              <Text style={[styles.actionLabel, saved && { color: Colors.primary }]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {showPicker && (
        <ReactionPicker
          current={post.userReaction}
          onSelect={handleReaction}
          onClose={() => setShowPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFound: { ...Typography.body, color: Colors.textSub },

  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#00000030',
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: '#00000060',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  heroBadgeText: {
    ...Typography.label,
    color: '#fff',
  },

  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
  authorInfo: { flex: 1, gap: 3 },
  authorName: { ...Typography.h2, color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...Typography.caption, color: Colors.textMuted },
  dot: { color: Colors.textMuted, marginHorizontal: 2 },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  divider: { height: 1, backgroundColor: Colors.border },

  sectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  reactionCount: {
    ...Typography.caption,
    color: Colors.textSub,
    fontWeight: '700',
  },
  reactionLabel: {
    ...Typography.caption,
    color: Colors.textSub,
  },

  commentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commentsText: { ...Typography.body, color: Colors.textSub },

  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  actionBtnActive: {
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primaryGlow,
  },
  actionLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
});
