import { Image } from 'expo-image';

/**
 * Precarga imágenes con persistencia en disco para disponibilidad offline.
 * Se llama tras cada batch cargado desde la API mientras hay conectividad.
 */
export function preloadImages(urls: string[]): void {
  urls.forEach(url => Image.prefetch(url, 'disk'));
}

/**
 * Solo libera RAM — preserva el caché en disco para modo offline.
 * Llamar al ir a background.
 */
export function clearMemoryCache(): void {
  Image.clearMemoryCache();
}

/**
 * Limpia disco + memoria. Solo llamar en pull-to-refresh explícito del usuario.
 */
export function clearAllImageCache(): void {
  Image.clearMemoryCache();
  Image.clearDiskCache();
}
