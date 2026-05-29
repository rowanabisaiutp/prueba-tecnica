import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedScreen } from '@/screens/FeedScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { LikesScreen } from '@/screens/LikesScreen';
import { PostDetailScreen } from '@/screens/PostDetailScreen';
import { Colors, Spacing } from '@/theme';

export type RootStackParamList = {
  Main: undefined;
  PostDetail: { postId: string };
};

export type MainTabParamList = {
  Feed: undefined;
  Saved: undefined;
  Likes: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: Spacing.xs,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, focused, size }) => {
          const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            Feed:  ['newspaper',   'newspaper-outline'],
            Saved: ['bookmark',    'bookmark-outline'],
            Likes: ['heart',       'heart-outline'],
          };
          const [filled, outline] = icons[route.name] ?? ['home', 'home-outline'];
          return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed"  component={FeedScreen}  options={{ tabBarAccessibilityLabel: 'Feed' }} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{ tabBarAccessibilityLabel: 'Saved posts' }} />
      <Tab.Screen name="Likes" component={LikesScreen} options={{ tabBarAccessibilityLabel: 'My reactions' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
