// kill switch served at the retired origins' /sw.js (public/_redirects
// consolidates every origin onto promote-species.app). Service workers
// cannot update through a redirect - their script fetch follows the
// origin's 301 and fails - so browsers holding a pre-consolidation
// worker from arten-fördern.app or arten-fördern.ch would serve its
// precache forever. The stale worker updates to this file instead,
// wipes the origin's caches and unregisters itself; the next navigation
// then follows the redirect to the canonical origin.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((key) => caches.delete(key)))
      await self.registration.unregister()
    })(),
  )
})
