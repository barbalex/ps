import { useMatches } from '@tanstack/react-router'
import { TransitionGroup } from 'react-transition-group'

import { FetcherRouter } from './FetcherRouter.tsx'
import styles from './index.module.css'

// this component extracts matches
export const Breadcrumbs = () => {
  const unfilteredMatches = useMatches()
  const navDataFetchers = unfilteredMatches
    .filter((match) => !!match.context?.navDataFetcher)
    .map((match) => match.context.navDataFetcher)
    .reverse()

  // flex-direction row-reverse combined with reverse order of matches
  // to align bookmarks to the right, but still have them in order
  return (
    <div className={`${styles.container} no-print`}>
      <TransitionGroup component={null}>
        {navDataFetchers.map((fetcherName) => (
          <FetcherRouter
            key={fetcherName}
            fetcherName={fetcherName}
          />
        ))}
      </TransitionGroup>
    </div>
  )
}
