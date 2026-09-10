// Shown while a route without its own pendingComponent is loading for
// longer than the router's default pendingMs (e.g. the first second of a
// cold /data load). Mirrors the static boot splash in index.html so the
// handoff is seamless.
export const DefaultPending = () => (
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
