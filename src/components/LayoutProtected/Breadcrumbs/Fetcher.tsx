import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { Loading } from '../../shared/Loading.tsx'
import { Crumb } from './Crumb/index.tsx'

// pass on TransitionGroup's props
export const Fetcher = memo(({ fetcherName, fetcherModule, ...other }) => {
  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const params = useParams({ strict: false })

  const { navData, loading } = fetcherModule?.[fetcherName]?.(params)

  if (loading) return <Loading />

  return (
    <Crumb
      key={`${navData.id}`}
      navData={navData}
      {...other}
    />
  )
})
