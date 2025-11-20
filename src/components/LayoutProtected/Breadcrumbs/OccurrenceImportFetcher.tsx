import { useOccurrenceImportNavData } from '../../../modules/useOccurrenceImportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrenceImportFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrenceImportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
