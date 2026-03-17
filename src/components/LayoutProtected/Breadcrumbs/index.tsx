import { useMatches } from '@tanstack/react-router'
import { TransitionGroup } from 'react-transition-group'

import { FetcherRouter } from './FetcherRouter.tsx'
import styles from './index.module.css'

/**
 * TanStack Router accumulates ALL URL params into every match's `params`
 * (including params from child route segments). To avoid leaking child params
 * (e.g. placeId) into ancestor breadcrumbs (e.g. level-1 places list), we
 * filter match.params to only those param names that appear in the routeId path.
 */
const getEffectiveParams = (
  routeId: string,
  matchParams: Record<string, string>,
) => {
  const definedParamNames = new Set<string>()
  for (const m of routeId.matchAll(/\$([A-Za-z][A-Za-z0-9]*)_?(?=\/|$)/g)) {
    definedParamNames.add(m[1])
  }
  return Object.fromEntries(
    Object.entries(matchParams).filter(([key]) => definedParamNames.has(key)),
  )
}

// this component extracts matches
export const Breadcrumbs = () => {
  const unfilteredMatches = useMatches()
  const navDataMatches = unfilteredMatches
    .filter((match) => !!match.context?.navDataFetcher)
    .map((match) => ({
      routeId: match.routeId,
      fetcherName: match.context.navDataFetcher,
      params: getEffectiveParams(match.routeId, match.params),
    }))
    .reverse()
    // Remove adjacent duplicate fetcherNames caused by child routes inheriting
    // parent beforeLoad context. In leaf→root order, keep the leaf-most entry.
    .filter(
      (match, index, arr) =>
        index === 0 || match.fetcherName !== arr[index - 1].fetcherName,
    )

  // flex-direction row-reverse combined with reverse order of matches
  // to align bookmarks to the right, but still have them in order
  return (
    <div className={`${styles.container} no-print`}>
      <TransitionGroup component={null}>
        {navDataMatches.map(({ routeId, fetcherName, params }) => (
          <FetcherRouter
            key={routeId}
            fetcherName={fetcherName}
            params={params}
          />
        ))}
      </TransitionGroup>
    </div>
  )
}
