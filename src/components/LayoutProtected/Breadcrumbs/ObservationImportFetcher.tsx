import { useObservationImportNavData } from '../../../modules/useObservationImportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
    observationImportId: string
  }
}

export const ObservationImportFetcher = ({ params, ...other }: Props) => {
  const { navData } = useObservationImportNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
