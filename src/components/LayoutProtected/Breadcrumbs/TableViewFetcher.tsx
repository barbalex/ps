import { useTableViewNavData } from '../../../modules/useTableViewNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTableViewNavData>[0]
}

export const TableViewFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useTableViewNavData(params)
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
