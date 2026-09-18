import { useCheckQuantitiesNavData } from '../../../modules/useCheckQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useCheckQuantitiesNavData>[0]
}

export const CheckQuantitiesFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useCheckQuantitiesNavData(params)
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
