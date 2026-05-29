export type ReactionType = 'like' | 'celebrate' | 'insightful' | 'support';

export interface Reactions {
  like: number;
  celebrate: number;
  insightful: number;
  support: number;
}

export interface Post {
  id: string;
  title: string;
  imageUrl: string;
  reactions: Reactions;
  userReaction: ReactionType | null;
  comments: number;
  readTime: number;
  createdAt: string;
  author: string;
  category: string;
}

export type FeedStatus = 'idle' | 'loading' | 'error' | 'empty';

export interface ReactionAction {
  postId: string;
  reactionType: ReactionType;
  timestamp: number;
}

// Keep backward compat alias for tests
export type LikeAction = ReactionAction;
