import { usePlaceLevelNavData } from '../../../modules/usePlaceLevelNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof usePlaceLevelNavData>[0]
}

export const PlaceLevelFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = usePlaceLevelNavData(params)
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
