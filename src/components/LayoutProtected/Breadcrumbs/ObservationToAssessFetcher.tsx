import { useObservationToAssessNavData } from '../../../modules/useObservationToAssessNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useObservationToAssessNavData>[0]
}

export const ObservationToAssessFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useObservationToAssessNavData(params)
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
