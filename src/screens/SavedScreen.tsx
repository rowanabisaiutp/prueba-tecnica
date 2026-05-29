import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { PostCard } from '@/components/PostCard';
import { Colors, Spacing, Typography, Radius } from '@/theme';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;

export function SavedScreen() {
  const { bookmarks } = useBookmarkStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoMark, { backgroundColor: Colors.primary }]} />
          <Text style={styles.headerTitle}>Saved</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{bookmarks.length}</Text>
        </View>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved posts</Text>
          <Text style={styles.emptySub}>Swipe left on any post to save it</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PostCard post={item} isConnected={true} />}
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
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
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
});
