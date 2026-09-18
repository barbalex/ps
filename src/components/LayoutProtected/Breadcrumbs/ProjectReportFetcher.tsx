import { useProjectReportNavData } from '../../../modules/useProjectReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectReportNavData>[0]
}

export const ProjectReportFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectReportNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
