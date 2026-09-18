import { useProjectReportDesignsNavData } from '../../../modules/useProjectReportDesignsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectReportDesignsNavData>[0]
}

export const ProjectReportDesignsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectReportDesignsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
