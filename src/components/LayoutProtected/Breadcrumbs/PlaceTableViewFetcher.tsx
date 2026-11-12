import { usePlaceTableViewNavData } from '../../../modules/usePlaceTableViewNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof usePlaceTableViewNavData>[0]
}

export const PlaceTableViewFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = usePlaceTableViewNavData(params)
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
