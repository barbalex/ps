import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { expect, test } from '@playwright/test'

// Vite dev mode doesn't install a worker. Serve two revisions on an isolated
// origin so Chromium exercises real install, activation and offline navigation.
test('updating replaces the app shell without losing offline files or reloading on a failed install', async ({
  page,
  context,
}) => {
  const helper = stripTypeScriptTypes(
    readFileSync('src/components/VersionCheck/prepareAppUpdate.ts', 'utf8'),
  )
  let version = 1
  const server = createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    if (req.url === '/update.js') {
      res.setHeader('Content-Type', 'text/javascript')
      return res.end(helper)
    }
    if (req.url === '/sw.js') {
      res.setHeader('Content-Type', 'text/javascript')
      return res.end(`
        self.addEventListener('install', e => e.waitUntil(
          ${
            version === 3 ?
              `Promise.reject(new Error('precache unavailable'))`
            : `caches.open('shell-${version}').then(c => c.add('/'))`
          }
        ))
        self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
        self.addEventListener('message', e => {
          if (e.data.type === 'SKIP_WAITING') e.waitUntil(self.skipWaiting())
        })
        self.addEventListener('fetch', e => {
          if (e.request.mode === 'navigate') e.respondWith(caches.open('shell-${version}').then(c => c.match('/')))
        })
      `)
    }
    res.setHeader('Content-Type', 'text/html')
    res.end(`<h1>Version ${version}</h1>
      <button onclick="update()">Update</button>
      <script type="module">
        import {prepareAppUpdate} from '/update.js'
        navigator.serviceWorker.register('/sw.js')
        window.update = async () => {
          try { await prepareAppUpdate(navigator.serviceWorker); location.reload() }
          catch { document.querySelector('button').textContent = 'Retry' }
        }
      </script>`)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    if (!address || typeof address === 'string')
      throw new Error('Missing fixture port')
    await page.goto(`http://127.0.0.1:${address.port}`)
    await page.waitForFunction(() => !!navigator.serviceWorker.controller)
    await page.evaluate(async () =>
      (await caches.open('offline-files')).put(
        '/saved',
        new Response('attachment'),
      ),
    )
    version = 2
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.getByRole('heading')).toHaveText('Version 2')
    version = 3
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    await context.setOffline(true)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading')).toHaveText('Version 2')
    expect(
      await page.evaluate(async () => (await caches.match('/saved'))?.text()),
    ).toBe('attachment')
  } finally {
    await context.setOffline(false)
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  }
})
