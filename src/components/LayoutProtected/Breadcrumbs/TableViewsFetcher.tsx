import { useTableViewsNavData } from '../../../modules/useTableViewsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTableViewsNavData>[0]
}

export const TableViewsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useTableViewsNavData(params)
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
