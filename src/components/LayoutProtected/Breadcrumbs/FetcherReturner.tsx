import { Suspense, type ReactElement } from 'react'

import { Crumb } from './Crumb/index.tsx'
import { Loading } from '../../shared/Loading.tsx'

type NavData = {
  id?: string
  label?: string
  ownUrl?: string
}

type Props = {
  navData?: NavData
  // passed on by TransitionGroup at runtime
  in?: boolean
}

// the label of Loading is optional at runtime
const LoadingWithOptionalLabel = Loading as (props: {
  label?: string
  alignLeft?: boolean
  size?: string
}) => ReactElement

// pass on TransitionGroup's props
export const FetcherReturner = ({ navData, ...other }: Props) => {
  // TODO: loading remains true and result never arrives
  if (!navData?.label) return null

  // TODO: navData.id does not exist
  return (
    <Suspense fallback={<LoadingWithOptionalLabel />}>
      <Crumb
        key={`${navData?.id ?? navData?.ownUrl}`}
        navData={navData}
        {...(other as { in: boolean })}
      />
    </Suspense>
  )
}
