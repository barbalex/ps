import { useVectorLayerDisplayNavData } from '../../../modules/useVectorLayerDisplayNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    vectorLayerId: string
    vectorLayerDisplayId: string
  }
}

export const VectorLayerDisplayFetcher = ({ params, ...other }: Props) => {
  const { navData } = useVectorLayerDisplayNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
