// Dev-only boot diagnostics: phase breadcrumbs plus a blank-screen watchdog.
// If the app paints nothing for >2s after boot, a raw-DOM panel appears with
// everything known at that moment (breadcrumbs, router state, last errors),
// so a blank page becomes self-describing instead of a mystery.
const ensureDiv = () => {
  if (typeof document === 'undefined') return null
  let el = document.getElementById('boot-trace')
  if (!el) {
    el = document.createElement('div')
    el.id = 'boot-trace'
    el.style.cssText =
      'position:fixed;bottom:34px;left:8px;z-index:99997;background:#ff0;color:#000;font:11px monospace;padding:2px 6px;white-space:pre;pointer-events:none;max-width:60vw'
    document.body.appendChild(el)
  }
  return el
}

const t0 = performance.now()
const lines: string[] = []

export const bootTrace = (step: string) => {
  if (!import.meta.env.DEV) return
  const line = `${Math.round(performance.now() - t0)}ms ${step}`
  lines.push(line)
  const el = ensureDiv()
  if (el) el.textContent = lines.slice(-8).join('\n')
}

const errors: string[] = []
export const recordBootError = (label: string, detail: unknown) => {
  if (!import.meta.env.DEV) return
  errors.push(
    `${label}: ${String(detail && (detail as { stack?: unknown }).stack ? (detail as { stack: unknown }).stack : detail).slice(0, 500)}`,
  )
  bootTrace(label)
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('error', (e) => recordBootError('window-error', e.message))
  window.addEventListener('unhandledrejection', (e) =>
    recordBootError('unhandled-rejection', e.reason),
  )

  // blank-screen watchdog: paints a diagnostic panel when #root stays empty
  let blankMs = 0
  let painted = false
  window.setInterval(() => {
    try {
      const root = document.getElementById('root')
      const bootDone = document.documentElement.dataset.boot === 'done'
      const hasContent =
        !!root &&
        root.childElementCount > 0 &&
        (root.textContent ?? '').trim() !== ''
      // stuck boot splash (router never resolved) counts as blank too
      const splashStuck = !bootDone && performance.now() > 10000
      if ((bootDone && !hasContent) || splashStuck) {
        blankMs += 500
        if (blankMs >= 2000 && !painted) {
          painted = true
          const routerState = (
            window as unknown as {
              __router__?: { state?: { status?: string; location?: { pathname?: string } } }
            }
          ).__router__?.state
          const el = document.createElement('div')
          el.style.cssText =
            'position:fixed;inset:0;z-index:99999;background:#fff;color:#000;font:12px monospace;padding:16px;white-space:pre-wrap;overflow:auto'
          el.textContent = [
            'BLANK SCREEN WATCHDOG',
            `mode: ${splashStuck ? 'boot splash stuck (router never resolved)' : 'root empty after boot done'}`,
            '',
            'breadcrumbs:',
            ...lines,
            '',
            'router: ' +
              JSON.stringify({
                status: routerState?.status,
                pathname: routerState?.location?.pathname,
              }),
            '',
            'errors:',
            ...errors.slice(-4),
          ].join('\n')
          document.body.appendChild(el)
        }
      } else {
        blankMs = 0
      }
    } catch {
      /* watchdog must never throw */
    }
  }, 500)
}
