import { useCheckQuantityNavData } from '../../../modules/useCheckQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useCheckQuantityNavData>[0]
}

export const CheckQuantityFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useCheckQuantityNavData(params)
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
