import { useProjectReportsNavData } from '../../../modules/useProjectReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectReportsNavData>[0]
}

export const ProjectReportsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectReportsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
