import { memo, useMemo, useEffect, useState } from 'react'
import { useMatches, useParams } from '@tanstack/react-router'
import { TransitionGroup } from 'react-transition-group'

import { FetcherImporter } from './FetcherImporter.jsx'

const containerStyle = {
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexWrap: 'nowrap',
  flexGrow: 1,
  flexShrink: 0,
  padding: '0 3px',
  minHeight: 40,
  borderBottom: 'rgba(46, 125, 50, 0.5) solid 1px',
  overflowX: 'auto',
  overflowY: 'hidden',
}

// this component extracts matches
export const Breadcrumbs = memo(() => {
  const unfilteredMatches = useMatches()
  const matches = unfilteredMatches
    .filter((match) => !!match.context?.navDataFetcher)
    .map((match) => match.context.navDataFetcher)

  // flex-direction row-reverse combined with reverse order of matches
  // to align bookmarks to the right, but still have them in order
  return (
    <div style={containerStyle}>
      <TransitionGroup component={null}>
        {matches.map((match) => (
          <FetcherImporter
            key={match.id}
            match={match}
          />
        ))}
      </TransitionGroup>
    </div>
  )
})
