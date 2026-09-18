import { useCheckReportsNavData } from '../../../modules/useCheckReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useCheckReportsNavData>[0]
}

export const CheckReportsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useCheckReportsNavData(params)
  // navData.id does not exist on NavData; bridge type-only
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
