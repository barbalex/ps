import { Crumb } from './Crumb/index.tsx'

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

// pass on TransitionGroup's props
export const FetcherReturner = ({ navData, ...other }: Props) => {
  // TODO: navData.id does not exist
  if (!navData?.label) return null

  return (
    <Crumb
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...(other as { in: boolean })}
    />
  )
}
