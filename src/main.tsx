// import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { installErrorTelemetry } from './modules/errorTelemetry.ts'
import { requestPersistentStorage } from './modules/requestPersistentStorage.ts'
import './style.css'

// consolidate every origin onto promote-species.app (rules in
// public/_redirects): Netlify 301s fresh visits, but a page served by a
// retired origin's service worker from its precache never reaches that
// redirect — and that worker can no longer update (its script fetch
// follows the origin's 301), so it is unregistered here too. hostname
// is punycode; localhost and Netlify deploy previews stay untouched
const retiredHosts = new Set([
  'xn--arten-frdern-bjb.app',
  'www.xn--arten-frdern-bjb.app',
  'xn--arten-frdern-bjb.ch',
  'www.xn--arten-frdern-bjb.ch',
])
if (retiredHosts.has(location.hostname)) {
  void navigator.serviceWorker
    ?.getRegistrations()
    .then((registrations) =>
      registrations.forEach((registration) => registration.unregister()),
    )
  location.replace(
    `https://promote-species.app${location.pathname}${location.search}${location.hash}`,
  )
}

// no-op unless VITE_ERROR_TELEMETRY=true is set at build time
installErrorTelemetry()

// fire-and-forget: marks IndexedDB (the PGlite database) as persistent
// so browsers don't evict it under storage pressure
void requestPersistentStorage()

// TEMPORARY debug aid: render render-crashes visibly instead of a blank screen
const showError = (label: string, detail: unknown) => {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;z-index:99999;top:0;left:0;right:0;background:#b00;color:#fff;font:12px monospace;padding:8px;white-space:pre-wrap;max-height:50vh;overflow:auto'
  el.textContent =
    label +
    ': ' +
    String(
      detail && typeof detail === 'object' && 'stack' in detail ?
        (detail as { stack: unknown }).stack
      : detail,
    ).slice(0, 2000)
  document.body.appendChild(el)
}
window.addEventListener('error', (e) => showError('ERR', e.message))
window.addEventListener('unhandledrejection', (e) => showError('REJ', e.reason))

import { ErrorBoundary } from './components/shared/ErrorBoundary.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
// causes LabelGenerator to run twice which deactivates dragging...
// .render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
