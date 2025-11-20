import { Suspense } from 'react'

import { Crumb } from './Crumb/index.tsx'
import { Loading } from '../../shared/Loading.tsx'

// pass on TransitionGroup's props
export const FetcherReturner = ({ navData, ...other }) => {
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
