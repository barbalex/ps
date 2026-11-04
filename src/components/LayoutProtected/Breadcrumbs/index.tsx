import { useRef, useState } from 'react'
import { useMatches } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { FetcherRouter } from './FetcherRouter.tsx'
import { FetcherReturner } from './FetcherReturner.tsx'
import { EXIT_DURATION } from './Crumb/index.tsx'
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

// routes set `navDataFetcher` in beforeLoad context, but the match context
// union does not expose it, so bridge it with a type-only assertion
type NavDataContext = {
  navDataFetcher: string
}

type CrumbSpec = {
  key: string
  fetcherName: string
  params: Record<string, string>
}

// this component extracts matches
export const Breadcrumbs = () => {
  const intl = useIntl()
  const unfilteredMatches = useMatches()
  const navDataMatches = unfilteredMatches
    .filter((match) => !!(match.context as NavDataContext | undefined)?.navDataFetcher)
    .map((match) => ({
      routeId: match.routeId,
      fetcherName: (match.context as NavDataContext).navDataFetcher,
      params: getEffectiveParams(match.routeId, match.params),
    }))
    .reverse()
    // Remove adjacent duplicate fetcherNames caused by child routes inheriting
    // parent beforeLoad context. In leaf→root order, keep the leaf-most entry.
    .filter(
      (match, index, arr) =>
        index === 0 || match.fetcherName !== arr[index - 1].fetcherName,
    )

  const crumbSpecs: CrumbSpec[] = navDataMatches.map(
    ({ routeId, fetcherName, params }) => ({
      key: routeId,
      fetcherName,
      params,
    }),
  )

  // keep removed crumbs mounted (with their params) while they fade and
  // collapse; the diff runs during render so removed crumbs never miss a frame
  const [exitingCrumbSpecs, setExitingCrumbSpecs] = useState<CrumbSpec[]>([])
  const prevCrumbSpecsRef = useRef<CrumbSpec[]>(crumbSpecs)
  if (prevCrumbSpecsRef.current !== crumbSpecs) {
    const currentKeys = new Set(crumbSpecs.map((spec) => spec.key))
    const removed = prevCrumbSpecsRef.current.filter(
      (spec) => !currentKeys.has(spec.key),
    )
    prevCrumbSpecsRef.current = crumbSpecs
    if (removed.length) {
      setExitingCrumbSpecs((prev) => [...prev, ...removed])
      for (const spec of removed) {
        setTimeout(() => {
          setExitingCrumbSpecs((prev) =>
            prev.filter((s) => s.key !== spec.key),
          )
        }, EXIT_DURATION)
      }
    }
  }

  // flex-direction row-reverse combined with reverse order of matches
  // to align bookmarks to the right, but still have them in order
  return (
    <div className={`${styles.container} no-print`}>
      {exitingCrumbSpecs.map((spec) => (
        <FetcherRouter
          key={`exiting-${spec.key}`}
          fetcherName={spec.fetcherName}
          params={spec.params}
          in={false}
        />
      ))}
      {crumbSpecs.map((spec) => (
        <FetcherRouter
          key={spec.key}
          fetcherName={spec.fetcherName}
          params={spec.params}
        />
      ))}
      <FetcherReturner
        key="__home"
        navData={{
          label: intl.formatMessage({
            id: 'navigationHome',
            defaultMessage: 'Home',
          }),
          ownUrl: '/',
        }}
      />
    </div>
  )
}
