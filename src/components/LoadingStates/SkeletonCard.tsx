import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/theme';

const IMAGE_ASPECT = 400 / 600;
const HEADER_H = 56;
const CONTENT_H = 88;

export const SkeletonCard = React.memo(() => {
  const { width } = useWindowDimensions();
  const imageHeight = Math.round((width - 32) * IMAGE_ASPECT);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View testID="skeleton-card" style={[styles.card, pulse]}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.authorBlock}>
          <View style={[styles.line, { width: '45%' }]} />
          <View style={[styles.line, { width: '28%', height: 10, marginTop: 4 }]} />
        </View>
        <View style={styles.tag} />
      </View>
      <View style={[styles.image, { height: imageHeight }]} />
      <View style={[styles.content, { height: CONTENT_H }]}>
        <View style={[styles.line, { width: '90%', height: 14 }]} />
        <View style={[styles.line, { width: '65%', height: 14, marginTop: Spacing.sm }]} />
        <View style={styles.divider} />
        <View style={styles.actions}>
          <View style={[styles.line, { width: 48, height: 10 }]} />
          <View style={[styles.line, { width: 36, height: 10 }]} />
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.surface3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: HEADER_H,
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: Colors.surface3,
  },
  authorBlock: { flex: 1 },
  tag: {
    width: 60,
    height: 20,
    borderRadius: 999,
    backgroundColor: Colors.surface3,
  },
  image: {
    width: '100%',
    backgroundColor: Colors.surface2,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    justifyContent: 'flex-start',
  },
  line: {
    height: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
});
