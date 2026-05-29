import { create } from 'zustand';
import { Post } from '@/types/post';
import { saveBookmark, removeBookmark, getBookmarks } from '@/storage/bookmarkStorage';

interface BookmarkState {
  bookmarks: Post[];
  isBookmarked: (postId: string) => boolean;
  toggle: (post: Post) => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: getBookmarks(),

  isBookmarked: (postId) => get().bookmarks.some(p => p.id === postId),

  toggle: (post) => {
    const { bookmarks, isBookmarked } = get();
    if (isBookmarked(post.id)) {
      removeBookmark(post.id);
      set({ bookmarks: bookmarks.filter(p => p.id !== post.id) });
    } else {
      saveBookmark(post);
      set({ bookmarks: [...bookmarks, post] });
    }
  },
}));
