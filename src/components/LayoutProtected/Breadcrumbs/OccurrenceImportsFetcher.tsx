import { useOccurrenceImportsNavData } from '../../../modules/useOccurrenceImportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrenceImportsFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrenceImportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
