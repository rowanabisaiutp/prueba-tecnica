# Smart Feed — Prueba Técnica React Native

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Home</b></td>
    <td align="center"><b>Favoritos</b></td>
    <td align="center"><b>Detalle de imagen</b></td>
  </tr>
  <tr>
    <td><img src="src/assets/home.jpeg" width="220"/></td>
    <td><img src="src/assets/favorites.jpeg" width="220"/></td>
    <td><img src="src/assets/img-details.jpeg" width="220"/></td>
  </tr>
  <tr>
    <td align="center"><b>Reacciones</b></td>
    <td align="center"><b>Compartir</b></td>
    <td align="center"><b>Compartir y guardar</b></td>
  </tr>
  <tr>
    <td><img src="src/assets/reactions.jpeg" width="220"/></td>
    <td><img src="src/assets/share.jpeg" width="220"/></td>
    <td><img src="src/assets/share-save.jpeg" width="220"/></td>
  </tr>
  <tr>
    <td align="center"><b>Modo offline</b></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td><img src="src/assets/offline_mode.jpeg" width="220"/></td>
    <td></td>
    <td></td>
  </tr>
</table>

---

## Arquitectura

```
src/
├── api/
│   ├── feedApi.ts          # Llamadas HTTP, paginación, mock de latencia/errores
│   └── mockServer.ts       # Generador de posts con datos falsos
├── storage/
│   ├── mmkvStorage.ts      # Wrapper MMKV para posts paginados
│   └── offlineQueue.ts     # Cola de acciones offline (likes, favoritos)
├── store/
│   ├── feedStore.ts        # Estado del feed: posts, página, status, concurrencia
│   └── offlineStore.ts     # Estado de la cola offline, persistido en MMKV
├── hooks/
│   ├── useFeed.ts          # Orquesta feedStore + caché + red
│   ├── useNetworkStatus.ts # isConnected, wasOffline
│   └── useOfflineSync.ts   # Dispara sync al reconectar
├── services/
│   ├── networkService.ts   # NetInfo + backoff exponencial
│   └── syncService.ts      # Vacía offlineQueue y sincroniza con API
├── components/
│   ├── PostCard/           # Tarjeta individual (memo, animaciones, swipeable)
│   ├── FeedList/           # FlashList optimizado con todos los estados
│   └── LoadingStates/      # Skeleton, error, empty, footer loader
├── screens/
│   └── FeedScreen.tsx      # Pantalla principal
├── navigation/
│   └── AppNavigator.tsx    # Stack + BottomTabs
├── types/
│   ├── post.ts             # Post, FeedStatus, ReactionType
│   └── api.ts              # FeedResponse, PaginationParams
└── utils/
    ├── imageCache.ts       # Precarga, caché en disco y cancelación de imágenes
    └── backoff.ts          # Backoff exponencial para reconexión

native/
├── android/
│   └── AverageColorModule.java   # Módulo nativo Android
└── ios/
    └── AverageColorModule.swift  # Módulo nativo iOS

__tests__/
├── unit/
│   ├── pagination.test.ts        # Lógica de paginación y concurrencia
│   └── offlineSync.test.ts       # enqueue / flush de acciones offline
└── integration/
    └── FeedScreen.test.tsx       # Render principal, scroll, estados
```
