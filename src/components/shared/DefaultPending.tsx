import { Initiating } from '../Initiating.tsx'
import { useMarkBootDone } from '../../modules/bootDone.ts'

const Spinner = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background:
        'radial-gradient(circle at top right, #f7fbf5, #f2f7ef 45%, #edf4ea)',
      color: '#2f3a2f',
      fontFamily: "system-ui, 'Helvetica Neue', Helvetica, sans-serif",
    }}
    aria-hidden="true"
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: '3px solid rgba(63, 138, 48, 0.25)',
        borderTopColor: '#3f8a30',
        animation: 'boot-splash-spin 1s linear infinite',
      }}
    />
  </div>
)

// Shown while a route without its own pendingComponent is loading for
// longer than the router's default pendingMs. On /data the DB-init screen
// is expected (the static shell already shows it), so keep showing it —
// elsewhere a neutral spinner mirroring the static boot splash.
export const DefaultPending = () => {
  useMarkBootDone()
  const isDataRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/data')
  return isDataRoute ? <Initiating /> : <Spinner />
}
