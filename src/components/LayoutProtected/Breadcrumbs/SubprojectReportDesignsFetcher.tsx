import { useSubprojectReportDesignsNavData } from '../../../modules/useSubprojectReportDesignsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectReportDesignsNavData>[0]
}

export const SubprojectReportDesignsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectReportDesignsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
