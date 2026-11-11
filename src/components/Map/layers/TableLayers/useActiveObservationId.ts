import { useLocation } from '@tanstack/react-router'

// URL segments under which the next path segment is an observation id
const OBSERVATION_SEGMENTS = new Set([
  'observations',
  'observations-to-assess',
  'observations-not-to-assign',
])

/**
 * The observation whose form is open — the active object of the navigation.
 * Passed to TableLayer as activeId so the map can mark it with a yellow halo.
 */
export const useActiveObservationId = (): string | undefined => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  const idx = pathParts.findIndex((part) => OBSERVATION_SEGMENTS.has(part))
  return idx !== -1 ? (pathParts[idx + 1] || undefined) : undefined
}
