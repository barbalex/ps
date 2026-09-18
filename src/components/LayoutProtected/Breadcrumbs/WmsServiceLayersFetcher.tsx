import { useWmsServiceLayersNavData } from '../../../modules/useWmsServiceLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useWmsServiceLayersNavData>[0]
}

export const WmsServiceLayersFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsServiceLayersNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
