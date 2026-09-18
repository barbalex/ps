// import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './style.css'

// TEMPORARY debug aid: render render-crashes visibly instead of a blank screen
const showError = (label: string, detail: unknown) => {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;z-index:99999;top:0;left:0;right:0;background:#b00;color:#fff;font:12px monospace;padding:8px;white-space:pre-wrap;max-height:50vh;overflow:auto'
  el.textContent =
    label +
    ': ' +
    String(
      detail && typeof detail === 'object' && 'stack' in detail
        ? (detail as { stack: unknown }).stack
        : detail,
    ).slice(0, 2000)
  document.body.appendChild(el)
}
window.addEventListener('error', (e) => showError('ERR', e.message))
window.addEventListener('unhandledrejection', (e) =>
  showError('REJ', e.reason),
)

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
