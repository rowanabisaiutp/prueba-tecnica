import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Share, Alert } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Post, ReactionType } from '@/types/post';
import { getAverageColor } from '@/utils/colorExtractor';
import { useFeedStore } from '@/store/feedStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { ReactionPicker } from './ReactionPicker';
import { SwipeActionSheet } from './SwipeActionSheet';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;

const IMAGE_HEIGHTS = [180, 220, 260, 200, 240, 170, 210, 250, 190, 230];
function getImageHeight(id: string): number {
  return IMAGE_HEIGHTS[parseInt(id, 10) % IMAGE_HEIGHTS.length];
}

const CATEGORY_COLORS = Colors.categoryColors;

interface PostCardProps {
  post: Post;
  isConnected: boolean;
}

function areEqual(prev: PostCardProps, next: PostCardProps) {
  return (
    prev.post.id === next.post.id &&
    prev.post.userReaction === next.post.userReaction &&
    prev.post.reactions === next.post.reactions &&
    prev.isConnected === next.isConnected
  );
}

// Área de swipe — solo una franja visual que indica "desliza"
const SwipeHint = React.memo(() => (
  <View style={styles.swipeHint}>
    <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
  </View>
));

export const PostCard = React.memo(({ post, isConnected }: PostCardProps) => {
  const navigation = useNavigation<NavProp>();
  const swipeableRef = useRef<Swipeable>(null);
  const imageHeight = getImageHeight(post.id);
  const accentColor = CATEGORY_COLORS[post.category.length % CATEGORY_COLORS.length];
  const bgColor = getAverageColor(post.imageUrl);

  const addReaction = useFeedStore(s => s.addReaction);
  const enqueue = useOfflineStore(s => s.enqueue);
  const { isBookmarked, toggle: toggleBookmark } = useBookmarkStore();
  const saved = isBookmarked(post.id);

  const [showPicker, setShowPicker] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
    scale.value = withSpring(1, { damping: 16, stiffness: 180 });
  }, [opacity, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  const onPressIn = useCallback(() => {
    pressScale.value = withSpring(0.97, { damping: 20 });
  }, [pressScale]);

  const onPressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 20 });
  }, [pressScale]);

  const handlePress = useCallback(() => {
    navigation.navigate('PostDetail', { postId: post.id });
  }, [post.id, navigation]);

  const handleReaction = useCallback((type: ReactionType) => {
    addReaction(post.id, type);
    if (!isConnected) enqueue({ postId: post.id, reactionType: type, timestamp: Date.now() });
  }, [post.id, isConnected, addReaction, enqueue]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: post.title,
        message: `${post.title}\n\nShared from Smart Feed`,
        url: post.imageUrl,
      });
    } catch {
      Alert.alert('Unable to share', 'Please try again.');
    }
  }, [post.title, post.imageUrl]);

  const handleSave = useCallback(() => {
    toggleBookmark(post);
  }, [post, toggleBookmark]);

  // Al completar el swipe → cerrar swipeable y abrir dialog
  const handleSwipeOpen = useCallback(() => {
    swipeableRef.current?.close();
    setShowSheet(true);
  }, []);

  const totalReactions = post.reactions
    ? Object.values(post.reactions).reduce((a, b) => a + b, 0)
    : 0;

  const hasReacted = post.userReaction !== null;
  const reactionColor = hasReacted
    ? (post.userReaction === 'like' ? Colors.like
      : post.userReaction === 'celebrate' ? Colors.celebrate
      : post.userReaction === 'insightful' ? Colors.insightful
      : Colors.support)
    : Colors.textSub;

  const initials = post.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const firstName = post.author.split(' ')[0];

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={() => <SwipeHint />}
        onSwipeableOpen={handleSwipeOpen}
        friction={2}
        overshootRight={false}
        rightThreshold={60}
      >
        <Animated.View style={[styles.card, { borderTopColor: accentColor }, cardStyle]}>
          <Pressable
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Post by ${post.author}: ${post.title}`}
            accessibilityHint="Tap to read. Swipe left for save and share options."
          >
            {/* Image */}
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: post.imageUrl }}
                style={[styles.image, { height: imageHeight }]}
                contentFit="cover"
                cachePolicy="disk"
                priority="normal"
                accessibilityLabel={`Image for: ${post.title}`}
              />
              <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.categoryText} numberOfLines={1}>{post.category}</Text>
              </View>
              {saved && (
                <View style={styles.savedIndicator}>
                  <Ionicons name="bookmark" size={14} color="#fff" />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={[styles.content, { backgroundColor: bgColor }]}>
              <Text style={styles.title} numberOfLines={3}>{post.title}</Text>
              <View style={styles.footer}>
                <View style={styles.authorRow}>
                  <View style={[styles.avatar, { backgroundColor: accentColor + '25' }]}>
                    <Text style={[styles.avatarText, { color: accentColor }]}>{initials}</Text>
                  </View>
                  <Text style={styles.authorName} numberOfLines={1}>{firstName}</Text>
                </View>
                <Pressable
                  style={styles.reactionBtn}
                  onPress={() => handleReaction('like')}
                  onLongPress={() => setShowPicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`${totalReactions} reactions. Long press for options.`}
                >
                  <Ionicons
                    name={hasReacted ? 'heart' : 'heart-outline'}
                    size={14}
                    color={reactionColor}
                  />
                  {totalReactions > 0 && (
                    <Text style={[styles.reactionCount, hasReacted && { color: reactionColor }]}>
                      {totalReactions}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Swipeable>

      {showPicker && (
        <ReactionPicker
          current={post.userReaction}
          onSelect={handleReaction}
          onClose={() => setShowPicker(false)}
        />
      )}

      <SwipeActionSheet
        visible={showSheet}
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onClose={() => setShowSheet(false)}
      />
    </>
  );
}, areEqual);

const styles = StyleSheet.create({
  card: {
    margin: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%' },
  categoryBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    maxWidth: '75%',
  },
  categoryText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  savedIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    backgroundColor: '#00000070',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  avatar: { width: 20, height: 20, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 9, fontWeight: '800' },
  authorName: { ...Typography.caption, color: Colors.textSub, flex: 1, fontSize: 11 },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: Spacing.xs },
  reactionCount: { fontSize: 11, fontWeight: '600', color: Colors.textSub },
  // Swipe hint
  swipeHint: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
});
