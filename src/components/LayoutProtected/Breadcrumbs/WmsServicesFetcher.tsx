import { useWmsServicesNavData } from '../../../modules/useWmsServicesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useWmsServicesNavData>[0]
}

export const WmsServicesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsServicesNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
