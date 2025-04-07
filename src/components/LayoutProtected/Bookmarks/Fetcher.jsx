import { memo, useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'

import { Spinner } from '../../shared/Spinner.jsx'
import { Bookmark } from './Bookmark/index.jsx'

// pass on TransitionGroup's props
export const Fetcher = memo(({ match, fetcherModule, ...other }) => {
  const params = useParams({ strict: false })
  const fetcherName = match.handle?.bookmarkFetcherName

  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const params = { ...match.params }

  const { navData, loading } = fetcherModule?.[fetcherName](params)

  if (loading) return <Spinner />

  return (
    <Bookmark
      key={`${navData.id}`}
      navData={navData}
      {...other}
    />
  )
})
