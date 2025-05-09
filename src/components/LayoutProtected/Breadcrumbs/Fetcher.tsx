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

  const res = fetcherModule?.[fetcherName]?.(params)
  const navData = res?.navData
  const loading = !!res?.loading

  // console.log('Fetcher', {
  //   fetcherName,
  //   navData,
  //   loading,
  //   res,
  // })

  if (loading) return <Loading width={120} />

  return (
    <Crumb
      key={`${navData.id}`}
      navData={navData}
      {...other}
    />
  )
})
