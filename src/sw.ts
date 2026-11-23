/// <reference lib="webworker" />
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

declare global {
  interface ServiceWorkerGlobalScope {
    // the precache manifest injected at build time by vite-plugin-pwa
    // (strategies: 'injectManifest' in vite.config.ts)
    __WB_MANIFEST: Parameters<typeof precacheAndRoute>[0]
  }
}

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
clientsClaim()

// SKIP_WAITING is sent by workbox-window (registerType 'autoUpdate') and by
// the version-check banner's cache-clearing reload
self.addEventListener('message', (event) => {
  if ((event as MessageEvent<{ type?: string }>).data?.type === 'SKIP_WAITING')
    self.skipWaiting()
})

// cold chunks are excluded from the precache (hashed, immutable URLs —
// CacheFirst is safe): offline still works after they have been loaded once
registerRoute(
  /\/assets\/.+\.(js|css|wasm)$/,
  new CacheFirst({
    cacheName: 'assets-on-first-use',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  }),
)

// On arten-fördern.ch the OAuth callback is a same-origin navigation
// to /auth/callback/google that the Netlify edge function must proxy
// to the auth server — without the denylist the navigation fallback
// serves the precached SPA shell instead, the authorization code never
// reaches the backend and the router shows its 404 page. '/auth'
// itself (the SPA login page, no trailing slash) keeps the fallback.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/auth\//],
  }),
)

// Offline files (src/modules/offlineFiles.ts): files marked offline (by a
// writer or — for all files of a table — by a designer) are fetched into
// this cache so preview image and file work without connectivity. The route
// consults ONLY this cache and never caches network responses itself: the
// cache must contain exactly the marked files, or unmarking could never
// free the space. The cache name is duplicated in offlineFiles.ts — the
// service worker must not import app code; keep them in sync.
const OFFLINE_FILES_CACHE = 'offline-files'

// Uploadcare delivers from the classic ucarecdn.com and the current
// per-project <project>.ucarecd.net domains (the cdnUrls the uploader
// hands out) — the cache must serve both, or marked files stay unfetched
// offline on new projects
registerRoute(
  /^https:\/\/(?:ucarecdn\.com|[\w-]+\.ucarecd\.net)\//,
  async ({ request, url }) => {
    const cache = await caches.open(OFFLINE_FILES_CACHE)
    const cached = await cache.match(url.href)
    if (cached) return cached
    return fetch(request)
  },
)
