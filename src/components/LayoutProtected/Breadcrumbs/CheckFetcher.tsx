import { useCheckNavData } from '../../../modules/useCheckNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useCheckNavData>[0]
}

export const CheckFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useCheckNavData(params)
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
