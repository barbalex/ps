import { useSubprojectReportNavData } from '../../../modules/useSubprojectReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectReportNavData>[0]
}

export const SubprojectReportFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectReportNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
