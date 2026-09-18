import { useVectorLayerDisplayVectorLayerDisplayNavData } from '../../../modules/useVectorLayerDisplayVectorLayerDisplayNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    vectorLayerId: string
    vectorLayerDisplayId: string
  }
}

export const VectorLayerDisplayVectorLayerDisplayFetcher = ({ params, ...other }: Props) => {
  const { navData } = useVectorLayerDisplayVectorLayerDisplayNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
