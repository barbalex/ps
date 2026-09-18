import { useObservationsNotToAssignNavData } from '../../../modules/useObservationsNotToAssignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useObservationsNotToAssignNavData>[0]
}

export const ObservationsNotToAssignFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useObservationsNotToAssignNavData(params)
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
