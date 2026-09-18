import { useProjectReportDesignNavData } from '../../../modules/useProjectReportDesignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectReportDesignNavData>[0]
}

export const ProjectReportDesignFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectReportDesignNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
