import { useSubprojectReportsNavData } from '../../../modules/useSubprojectReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectReportsFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
