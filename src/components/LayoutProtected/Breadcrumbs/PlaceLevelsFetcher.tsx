import { usePlaceLevelsNavData } from '../../../modules/usePlaceLevelsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof usePlaceLevelsNavData>[0]
}

export const PlaceLevelsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = usePlaceLevelsNavData(params)
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
