import { useTableChecksNavData } from '../../../modules/useTableChecksNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTableChecksNavData>[0]
}

export const TableChecksFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useTableChecksNavData(params)
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
