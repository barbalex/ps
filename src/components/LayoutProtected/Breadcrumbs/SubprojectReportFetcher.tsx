import { useSubprojectReportNavData } from '../../../modules/useSubprojectReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectReportFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
