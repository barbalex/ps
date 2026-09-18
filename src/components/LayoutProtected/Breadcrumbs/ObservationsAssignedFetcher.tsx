import { useObservationsAssignedNavData } from '../../../modules/useObservationsAssignedNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useObservationsAssignedNavData>[0]
}

export const ObservationsAssignedFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useObservationsAssignedNavData(params)
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
