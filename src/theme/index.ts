export const Colors = {
  bg: '#07070E',
  surface: '#0D0D1C',
  surface2: '#13132A',
  surface3: '#1A1A35',
  border: '#1C1C36',
  borderLight: '#26264A',

  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryGlow: '#6366F118',

  text: '#EEEEFF',
  textSub: '#8890B0',
  textMuted: '#44446A',

  like: '#F43F5E',
  celebrate: '#F59E0B',
  insightful: '#3B82F6',
  support: '#10B981',

  success: '#10B981',
  error: '#EF4444',
  offline: '#F87171',

  categoryColors: [
    '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
    '#F59E0B', '#10B981', '#3B82F6', '#14B8A6',
  ],
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 9999,
};

export const Typography = {
  h1: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
};
