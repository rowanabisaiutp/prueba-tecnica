import { Image } from 'expo-image';

export function preloadImages(urls: string[]): void {
  Image.prefetch(urls);
}

export function clearImageCache(): void {
  Image.clearMemoryCache();
  Image.clearDiskCache();
}
