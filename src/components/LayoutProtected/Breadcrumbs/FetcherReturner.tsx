import { Crumb } from './Crumb/index.tsx'

type NavData = {
  id?: string
  label?: string
  ownUrl?: string
}

type Props = {
  navData?: NavData
}

export const FetcherReturner = ({ navData }: Props) => {
  // TODO: navData.id does not exist
  if (!navData?.label) return null

  return (
    <Crumb
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
    />
  )
}
