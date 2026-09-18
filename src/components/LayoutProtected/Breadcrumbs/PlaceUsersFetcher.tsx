import { usePlaceUsersNavData } from '../../../modules/usePlaceUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof usePlaceUsersNavData>[0]
}

export const PlaceUsersFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = usePlaceUsersNavData(params)
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
