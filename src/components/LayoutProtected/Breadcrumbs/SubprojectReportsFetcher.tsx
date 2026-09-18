import { useSubprojectReportsNavData } from '../../../modules/useSubprojectReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectReportsNavData>[0]
}

export const SubprojectReportsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectReportsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
