import { Post, Reactions } from '@/types/post';

const AUTHORS = [
  'Sarah Connor', 'James Rivera', 'Mia Chen', 'David Park',
  'Elena Vasquez', 'Noah Williams', 'Priya Nair', 'Lucas Martin',
];

const CATEGORIES = ['Technology', 'Design', 'Science', 'Engineering', 'Product', 'Data', 'Security', 'Mobile'];

const TITLES = [
  'The Future of Mobile Development in 2025',
  'Design Systems That Scale Across Teams',
  'Why TypeScript Is Now Non-Negotiable',
  'Building Resilient React Native Architecture',
  'State Management: Choosing the Right Tool',
  'Mastering Animations for Production Apps',
  'Offline-First: Architecture and Trade-offs',
  'The Art of Performance Optimization at Scale',
  'Native Modules: When and How to Write Them',
  'Gesture Handling in Complex UI Interactions',
  'Testing Strategies for Mobile Applications',
  'From Redux to Zustand: A Real Migration',
  'Image Caching Strategies That Actually Work',
  'Network Resilience and Reconnection Patterns',
  'Component Architecture for Large Codebases',
  'FlatList Deep Dive: 60fps at Any Scale',
  'Accessibility as a First-Class Citizen',
  'From Development to Production: What Changes',
  'CI/CD Pipelines for Mobile Teams',
  'Code Review Culture and Technical Debt',
];

function generateReactions(seed: number): Reactions {
  return {
    like: Math.floor(((seed * 17 + 42) % 400) + 10),
    celebrate: Math.floor(((seed * 7 + 13) % 120)),
    insightful: Math.floor(((seed * 11 + 5) % 200)),
    support: Math.floor(((seed * 3 + 22) % 80)),
  };
}

export const ALL_POSTS: Post[] = Array.from({ length: 200 }, (_, i) => ({
  id: String(i + 1),
  title: TITLES[i % TITLES.length],
  imageUrl: `https://picsum.photos/id/${(i % 85) + 10}/600/400`,
  reactions: generateReactions(i),
  userReaction: null,
  comments: Math.floor(((i * 9 + 7) % 60)),
  readTime: Math.floor(((i % 7) + 2)),
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  author: AUTHORS[i % AUTHORS.length],
  category: CATEGORIES[i % CATEGORIES.length],
}));
