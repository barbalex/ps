import { useWmsServiceLayerNavData } from '../../../modules/useWmsServiceLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wmsServiceId: string
    wmsServiceLayerId: string
  }
}

export const WmsServiceLayerFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsServiceLayerNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
