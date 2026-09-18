import { useVectorLayerVectorLayerNavData } from '../../../modules/useVectorLayerVectorLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    vectorLayerId: string
  }
}

export const VectorLayerVectorLayerFetcher = ({ params, ...other }: Props) => {
  const { navData } = useVectorLayerVectorLayerNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
