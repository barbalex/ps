import { usePlaceUserNavData } from '../../../modules/usePlaceUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof usePlaceUserNavData>[0]
}

export const PlaceUserFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = usePlaceUserNavData(params)
  // navData.id does not exist on NavData; bridge type-only
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
