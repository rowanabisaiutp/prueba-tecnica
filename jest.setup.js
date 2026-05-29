import 'react-native-gesture-handler/jestSetup';

// @expo/vector-icons — usa assets nativos no disponibles en Jest
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = ({ name, ...rest }) => React.createElement(Text, rest, name ?? '');
  Icon.glyphMap = {};
  return { Ionicons: Icon, Feather: Icon, MaterialIcons: Icon };
});

// react-native-reanimated v4 — mock manual (usa ESM internamente)
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const identity = (v) => v;
  const noop = () => {};
  const useSharedValue = (init) => ({ value: init, addListener: noop, removeListener: noop });
  const useAnimatedStyle = (fn) => { try { return fn(); } catch { return {}; } };
  return {
    __esModule: true,
    default: { View, Text: View, Image: View, ScrollView: View, createAnimatedComponent: (c) => c },
    View,
    Text: View,
    Image: View,
    ScrollView: View,
    createAnimatedComponent: (c) => c,
    useSharedValue,
    useAnimatedStyle,
    withTiming: identity,
    withSpring: identity,
    withRepeat: identity,
    withDelay: identity,
    withSequence: identity,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    Easing: { in: identity, out: identity, inOut: identity, ease: identity, linear: identity },
    interpolate: identity,
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => noop,
    useAnimatedGestureHandler: () => noop,
    cancelAnimation: noop,
    measure: noop,
    scrollTo: noop,
  };
});

// expo-image — usa ESM, no compatible con el transform de bare RN en Jest
jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  const ExpoImage = (props) => Image(props);
  ExpoImage.prefetch = jest.fn(() => Promise.resolve(true));
  ExpoImage.clearMemoryCache = jest.fn(() => Promise.resolve());
  ExpoImage.clearDiskCache = jest.fn(() => Promise.resolve());
  return { Image: ExpoImage };
});

// react-native-mmkv — no tiene módulo nativo en Jest
jest.mock('react-native-mmkv', () => {
  const store = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key, value) => { store[key] = value; },
      getString: (key) => store[key],
      delete: (key) => { delete store[key]; },
    })),
  };
});

// @react-native-community/netinfo — módulo nativo no disponible en Jest
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  useNetInfo: jest.fn(() => ({ isConnected: true })),
}));
