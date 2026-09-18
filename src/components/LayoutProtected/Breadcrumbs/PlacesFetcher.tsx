import { usePlacesNavData } from '../../../modules/usePlacesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof usePlacesNavData>[0]
}

export const PlacesFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = usePlacesNavData(params)
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
