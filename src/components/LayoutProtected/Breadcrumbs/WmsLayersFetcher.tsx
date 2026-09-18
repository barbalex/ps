import { useWmsLayersNavData } from '../../../modules/useWmsLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
  }
}

export const WmsLayersFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsLayersNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
