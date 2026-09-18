import { useVectorLayerNavData } from '../../../modules/useVectorLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    vectorLayerId: string
  }
}

export const VectorLayerFetcher = ({ params, ...other }: Props) => {
  const { navData } = useVectorLayerNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
