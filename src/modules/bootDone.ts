import { useLayoutEffect } from 'react'

// The static boot shell (index.html) lives outside #root and stays visible
// until the app has committed real content — otherwise React's first
// (possibly still empty) render would leave a white flash while the router
// loads its initial matches. Components that paint real content call this
// to hide the shell in the same frame they appear in.
export const useMarkBootDone = () => {
  useLayoutEffect(() => {
    document.documentElement.dataset.boot = 'done'
  }, [])
}

export const markBootDone = () => {
  document.documentElement.dataset.boot = 'done'
}
