import { useWmsLayerNavData } from '../../../modules/useWmsLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wmsLayerId: string
  }
}

export const WmsLayerFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsLayerNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
