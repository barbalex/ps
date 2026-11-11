import { useTableCheckNavData } from '../../../modules/useTableCheckNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useTableCheckNavData>[0]
}

export const TableCheckFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useTableCheckNavData(params)
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
