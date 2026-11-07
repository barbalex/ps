import { Crumb } from './Crumb/index.tsx'

type NavData = {
  id?: string
  label?: string
  ownUrl?: string
}

type Props = {
  navData?: NavData
  // passed on by Breadcrumbs at runtime
  in?: boolean
  // true when this crumb is new (fade in and grow)
  enter?: boolean
}

// pass on Breadcrumbs' props
export const FetcherReturner = ({ navData, ...other }: Props) => {
  // TODO: navData.id does not exist
  if (!navData?.label) return null

  return (
    <Crumb
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...(other as { in?: boolean; enter?: boolean })}
    />
  )
}
