import { useObservationImportsNavData } from '../../../modules/useObservationImportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
  }
}

export const ObservationImportsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useObservationImportsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
