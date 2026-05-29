/**
 * Mock JS del módulo nativo getAverageColor.
 * Deriva un color HSL pseudo-aleatorio a partir del ID de la imagen de Picsum.
 * La implementación nativa real está en native/android y native/ios.
 */
export function getAverageColor(imageUri: string): string {
  const match = imageUri.match(/\/id\/(\d+)\//);
  const id = match ? parseInt(match[1], 10) : 0;
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 35%, 80%)`;
}
