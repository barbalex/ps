import { useObservationsToAssessNavData } from '../../../modules/useObservationsToAssessNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useObservationsToAssessNavData>[0]
}

export const ObservationsToAssessFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useObservationsToAssessNavData(params)
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
