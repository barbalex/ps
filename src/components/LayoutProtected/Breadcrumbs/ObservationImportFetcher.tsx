import { useObservationImportNavData } from '../../../modules/useObservationImportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationImportFetcher = ({ params, ...other }) => {
  const { navData } = useObservationImportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
