import { useObservationImportsNavData } from '../../../modules/useObservationImportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationImportsFetcher = ({ params, ...other }) => {
  const { navData } = useObservationImportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
