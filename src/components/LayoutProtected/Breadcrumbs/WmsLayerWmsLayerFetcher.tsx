import { useWmsLayerWmsLayerNavData } from '../../../modules/useWmsLayerWmsLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wmsLayerId: string
  }
}

export const WmsLayerWmsLayerFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsLayerWmsLayerNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
