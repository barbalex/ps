import { useWmsServiceWmsServiceNavData } from '../../../modules/useWmsServiceWmsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useWmsServiceWmsServiceNavData>[0]
}

export const WmsServiceWmsServiceFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsServiceWmsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
