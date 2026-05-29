import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ReactionType } from '@/types/post';
import { Colors, Radius, Spacing } from '@/theme';

interface Reaction {
  type: ReactionType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

const REACTIONS: Reaction[] = [
  { type: 'like',        icon: 'heart',        label: 'Like',       color: Colors.like },
  { type: 'celebrate',   icon: 'flash',        label: 'Celebrate',  color: Colors.celebrate },
  { type: 'insightful',  icon: 'bulb',         label: 'Insight',    color: Colors.insightful },
  { type: 'support',     icon: 'thumbs-up',    label: 'Support',    color: Colors.support },
];

interface Props {
  current: ReactionType | null;
  onSelect: (type: ReactionType) => void;
  onClose: () => void;
}

export function ReactionPicker({ current, onSelect, onClose }: Props) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  }, [opacity, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleSelect = (type: ReactionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.picker, containerStyle]}>
          {REACTIONS.map(r => (
            <Pressable
              key={r.type}
              style={[styles.item, current === r.type && styles.itemActive]}
              onPress={() => handleSelect(r.type)}
              accessibilityLabel={r.label}
              accessibilityRole="button"
            >
              <View style={[styles.iconWrap, { backgroundColor: r.color + '20' }]}>
                <Ionicons name={r.icon} size={22} color={r.color} />
              </View>
              <Text style={[styles.label, current === r.type && { color: r.color }]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    flexDirection: 'row',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  itemActive: {
    backgroundColor: Colors.surface3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSub,
    letterSpacing: 0.2,
  },
});
