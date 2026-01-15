import { useSubprojectReportDesignNavData } from '../../../modules/useSubprojectReportDesignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectReportDesignFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectReportDesignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
