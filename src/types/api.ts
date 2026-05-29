import { Post } from './post';

export interface FeedResponse {
  page: number;
  posts: Post[];
  hasNextPage: boolean;
}

export interface PaginationParams {
  page: number;
  limit?: number;
}
