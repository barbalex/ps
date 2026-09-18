import { useChecksNavData } from '../../../modules/useChecksNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useChecksNavData>[0]
}

export const ChecksFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useChecksNavData(params)
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
