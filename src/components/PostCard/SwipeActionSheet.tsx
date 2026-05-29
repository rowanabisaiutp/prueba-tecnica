import React, { useEffect } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/theme';

interface Props {
  visible: boolean;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onClose: () => void;
}

export function SwipeActionSheet({ visible, saved, onSave, onShare, onClose }: Props) {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.ease) });
      translateY.value = withTiming(300, { duration: 200, easing: Easing.in(Easing.cubic) });
    }
  }, [visible, opacity, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSave = () => { onSave(); onClose(); };
  const handleShare = () => { onShare(); onClose(); };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Actions */}
          <Pressable
            style={styles.action}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove from saved' : 'Save post'}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={Colors.primary}
              />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{saved ? 'Remove from Saved' : 'Save Post'}</Text>
              <Text style={styles.actionSub}>{saved ? 'Remove from your collection' : 'Add to your collection'}</Text>
            </View>
            {saved && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            style={styles.action}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share post"
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.support + '20' }]}>
              <Ionicons name="share-social-outline" size={22} color={Colors.support} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Share Post</Text>
              <Text style={styles.actionSub}>Share with friends and contacts</Text>
            </View>
          </Pressable>

          {/* Cancel */}
          <Pressable style={styles.cancelBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000070',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface2,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, gap: 2 },
  actionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  actionSub: {
    ...Typography.caption,
    color: Colors.textSub,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.xs,
  },
  cancelBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSub,
    fontWeight: '600',
  },
});
