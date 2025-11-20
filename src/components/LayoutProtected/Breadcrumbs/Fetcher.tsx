import { Suspense } from 'react'

import { Crumb } from './Crumb/index.tsx'
import { Loading } from '../../shared/Loading.tsx'

// pass on TransitionGroup's props
export const Fetcher = ({ fetcherModule, params, ...other }) => {
  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const { navData, error } = fetcherModule(params)

  console.log('Breadcrumbs.Fetcher', {
    navData,
    error,
  })

  // TODO: loading remains true and result never arrives
  if (!navData?.label) return null

  // TODO: navData.id does not exist
  return (
    <Suspense fallback={<Loading />}>
      <Crumb
        key={`${navData?.id ?? navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    </Suspense>
  )
}
