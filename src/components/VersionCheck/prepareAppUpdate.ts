// The old worker must retain its app shell until the replacement has
// finished precaching and activating. Workbox cleans obsolete revisions.
export async function prepareAppUpdate(
  workers: ServiceWorkerContainer | undefined,
) {
  const registration = await workers?.getRegistration()
  if (!registration) return

  if (!registration.waiting && !registration.installing)
    await registration.update()
  const worker =
    registration.waiting ?? registration.installing ?? registration.active
  if (!worker) throw new Error('No service worker available after update')
  if (worker.state === 'activated') return

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout)
      worker.removeEventListener('statechange', check)
    }
    const check = () => {
      if (worker.state === 'installed') {
        worker.postMessage({ type: 'SKIP_WAITING' })
      } else if (worker.state === 'activated') {
        cleanup()
        resolve()
      } else if (worker.state === 'redundant') {
        cleanup()
        reject(new Error('Replacement service worker failed to activate'))
      }
    }
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Timed out waiting for the replacement service worker'))
    }, 120_000)
    worker.addEventListener('statechange', check)
    check()
  })
}
